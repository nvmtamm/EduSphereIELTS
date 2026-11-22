using System.Text.Json;
using EduSphere.Application.Common.Interfaces;
using EduSphere.Application.Common.Models;
using EduSphere.Application.Features.Reading.Models;
using EduSphere.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EduSphere.Application.Features.Reading.Queries.GetReadingHint;

public record GetReadingHintQuery(Guid PassageId, Guid QuestionId, int Step) : IRequest<Result<ReadingHintDto>>;

public class GetReadingHintQueryHandler : IRequestHandler<GetReadingHintQuery, Result<ReadingHintDto>>
{
    public const int MaxStep = 4;

    private static readonly HashSet<string> StopWords = new(StringComparer.OrdinalIgnoreCase)
    {
        "the","a","an","and","or","of","to","in","on","at","for","with","by","from","that","this","these","those",
        "is","are","was","were","be","been","being","it","its","as","which","who","whom","what","when","where",
        "than","then","there","their","they","them","he","she","his","her","has","have","had","not","but","also",
        "can","could","will","would","should","may","might","do","does","did","about","into","over","more","most"
    };

    private readonly IApplicationDbContext _context;
    private readonly IReadingAITutorService _aiTutorService;

    public GetReadingHintQueryHandler(IApplicationDbContext context, IReadingAITutorService aiTutorService)
    {
        _context = context;
        _aiTutorService = aiTutorService;
    }

    public async Task<Result<ReadingHintDto>> Handle(GetReadingHintQuery request, CancellationToken cancellationToken)
    {
        if (request.Step is < 1 or > MaxStep)
        {
            return Result.Failure<ReadingHintDto>(new Error("Reading.InvalidHintStep", $"Hint step must be between 1 and {MaxStep}."));
        }

        var question = await _context.ReadingQuestions
            .AsNoTracking()
            .Include(q => q.Passage)
            .FirstOrDefaultAsync(q => q.Id == request.QuestionId && q.PassageId == request.PassageId, cancellationToken);

        if (question == null)
        {
            return Result.Failure<ReadingHintDto>(new Error("Reading.QuestionNotFound", "Question was not found."));
        }

        var keywords = ExtractKeywords(question.Prompt);
        var hasNext = request.Step < MaxStep;

        switch (request.Step)
        {
            case 1:
                return Result.Success(new ReadingHintDto(
                    1, "Understand the question",
                    DescribeTask(question.QuestionType, question.Prompt),
                    keywords, null, hasNext));

            case 2:
                return Result.Success(new ReadingHintDto(
                    2, "Locate the evidence",
                    keywords.Count > 0
                        ? $"Scan the passage for these key ideas or their synonyms: {string.Join(", ", keywords)}. " +
                          "The passage will usually paraphrase the question, so look for meaning rather than identical words."
                        : "Skim the topic sentence of each paragraph and note where the question's main idea appears.",
                    keywords, null, hasNext));

            case 3:
                var tutor = await _aiTutorService.AskTutorAsync(
                    "Point me to the paragraph or sentence I should read for this question. Do NOT reveal the final answer.",
                    question.Passage.Title,
                    question.Passage.Content,
                    question.Prompt,
                    isPostExamReview: false,
                    cancellationToken);

                return Result.Success(new ReadingHintDto(
                    3, "Read the evidence",
                    tutor.Message, keywords, tutor.RelevantParagraph, hasNext));

            default:
                var explanation = string.IsNullOrWhiteSpace(question.Explanation)
                    ? "Compare the meaning of each option with the evidence you found, then eliminate options that contradict or go beyond the text."
                    : question.Explanation;

                return Result.Success(new ReadingHintDto(
                    4, "Check and choose",
                    $"Answer: {FormatAnswer(question.CorrectAnswer, question.QuestionType)}\n\n{explanation}",
                    keywords, null, false));
        }
    }

    private static string DescribeTask(QuestionType type, string prompt) => type switch
    {
        QuestionType.TrueFalseNotGiven =>
            "True / False / Not Given: decide whether the passage agrees (TRUE), contradicts (FALSE) or does not mention (NOT GIVEN) the statement. " +
            $"Statement to test: \"{prompt}\"",
        QuestionType.YesNoNotGiven =>
            "Yes / No / Not Given: compare the statement with the writer's views. YES = agrees, NO = contradicts, NOT GIVEN = no opinion stated. " +
            $"Statement to test: \"{prompt}\"",
        QuestionType.MatchingHeadings =>
            "Matching Headings: find the main idea of the paragraph (usually the first or last sentence) and pick the heading that covers the whole paragraph, not just a detail.",
        QuestionType.MatchingInformation =>
            "Matching Information: find the paragraph that contains the specific information described. Several items can point to the same paragraph, and the wording will be paraphrased.",
        QuestionType.MultipleChoiceMulti =>
            "Choose TWO letters: two options are correct. Check each option against the passage and select exactly the number requested.",
        QuestionType.MultipleChoice =>
            "Multiple choice: read the stem carefully, find the relevant section, then test each option against the text. Watch for distractors that use words from the passage with a different meaning.",
        QuestionType.ShortAnswer =>
            "Short answer: note the word limit in the instructions, then find the exact words in the passage that answer the question.",
        _ =>
            $"Completion task: work out what kind of word is missing (noun, verb, number, adjective) and respect the word limit. Sentence: \"{prompt}\""
    };

    private static string FormatAnswer(string correctAnswer, QuestionType type) =>
        type == QuestionType.MultipleChoiceMulti ? correctAnswer.Replace(" ", string.Empty).Replace(",", ", ") : correctAnswer;

    private static List<string> ExtractKeywords(string prompt)
    {
        var words = prompt
            .Split(new[] { ' ', ',', '.', ';', ':', '(', ')', '"', '\'', '?', '!', '_' }, StringSplitOptions.RemoveEmptyEntries)
            .Select(w => w.Trim('-'))
            .Where(w => w.Length > 3 && !StopWords.Contains(w) && !w.All(char.IsDigit))
            .Select(w => w.ToLowerInvariant())
            .Distinct()
            .Take(5)
            .ToList();

        return words;
    }
}
