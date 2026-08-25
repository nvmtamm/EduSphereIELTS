using EduSphere.RAG.Indexing;

namespace EduSphere.RAG.VectorStores;

public interface IVectorStore
{
    Task UpsertChunksAsync(string collectionName, List<PassageChunk> chunks, List<float[]> embeddings, CancellationToken cancellationToken = default);
    Task<List<SearchResultItem>> SearchSimilarAsync(string collectionName, float[] queryEmbedding, int topK = 3, CancellationToken cancellationToken = default);
}

public record SearchResultItem(
    string ChunkId,
    string ParagraphLabel,
    string Content,
    float SimilarityScore);

public class InMemoryVectorStore : IVectorStore
{
    private readonly Dictionary<string, List<(PassageChunk Chunk, float[] Vector)>> _collections = new();

    public Task UpsertChunksAsync(string collectionName, List<PassageChunk> chunks, List<float[]> embeddings, CancellationToken cancellationToken = default)
    {
        if (!_collections.ContainsKey(collectionName))
        {
            _collections[collectionName] = new();
        }

        for (int i = 0; i < chunks.Count; i++)
        {
            _collections[collectionName].Add((chunks[i], embeddings[i]));
        }

        return Task.CompletedTask;
    }

    public Task<List<SearchResultItem>> SearchSimilarAsync(string collectionName, float[] queryEmbedding, int topK = 3, CancellationToken cancellationToken = default)
    {
        if (!_collections.TryGetValue(collectionName, out var entries))
        {
            return Task.FromResult(new List<SearchResultItem>());
        }

        var scored = entries.Select(e => new SearchResultItem(
            e.Chunk.ChunkId,
            e.Chunk.ParagraphLabel,
            e.Chunk.Content,
            ComputeCosineSimilarity(e.Vector, queryEmbedding)
        ))
        .OrderByDescending(s => s.SimilarityScore)
        .Take(topK)
        .ToList();

        return Task.FromResult(scored);
    }

    private static float ComputeCosineSimilarity(float[] a, float[] b)
    {
        float dot = 0f, normA = 0f, normB = 0f;
        for (int i = 0; i < Math.Min(a.Length, b.Length); i++)
        {
            dot += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }
        return (normA == 0 || normB == 0) ? 0f : dot / (MathF.Sqrt(normA) * MathF.Sqrt(normB));
    }
}
