using System.Text.RegularExpressions;

namespace EduSphere.RAG.Indexing;

public record PassageChunk(
    string ChunkId,
    string PassageId,
    string ParagraphLabel,
    string Content,
    int WordCount);

public class IELTSPassageChunker
{
    public List<PassageChunk> ChunkPassage(string passageId, string fullText)
    {
        var chunks = new List<PassageChunk>();
        var pattern = @"###\s*Paragraph\s*([A-Z])";
        var parts = Regex.Split(fullText, pattern, RegexOptions.IgnoreCase);

        if (parts.Length <= 1)
        {
            // Fallback: chunk by double newlines
            var paragraphs = fullText.Split(new[] { "\n\n", "\r\n\r\n" }, StringSplitOptions.RemoveEmptyEntries);
            for (int i = 0; i < paragraphs.Length; i++)
            {
                var label = ((char)('A' + i)).ToString();
                var text = paragraphs[i].Trim();
                chunks.Add(new PassageChunk(
                    ChunkId: $"{passageId}_{label}",
                    PassageId: passageId,
                    ParagraphLabel: $"Paragraph {label}",
                    Content: text,
                    WordCount: text.Split(' ', StringSplitOptions.RemoveEmptyEntries).Length));
            }
            return chunks;
        }

        for (int i = 1; i < parts.Length; i += 2)
        {
            var label = parts[i].Trim();
            var content = i + 1 < parts.Length ? parts[i + 1].Trim() : string.Empty;

            chunks.Add(new PassageChunk(
                ChunkId: $"{passageId}_{label}",
                PassageId: passageId,
                ParagraphLabel: $"Paragraph {label}",
                Content: content,
                WordCount: content.Split(' ', StringSplitOptions.RemoveEmptyEntries).Length));
        }

        return chunks;
    }
}
