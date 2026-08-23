using System.Text.Json.Serialization;

namespace EduSphere.Application.Common.Models;

public class PagedList<T>
{
    public IReadOnlyCollection<T> Items { get; init; } = Array.Empty<T>();
    public int PageNumber { get; init; }
    public int PageSize { get; init; }
    public int TotalCount { get; init; }
    public int TotalPages => PageSize > 0 ? (int)Math.Ceiling(TotalCount / (double)PageSize) : 0;
    public bool HasPreviousPage => PageNumber > 1;
    public bool HasNextPage => PageNumber < TotalPages;

    public PagedList() { }

    [JsonConstructor]
    public PagedList(IReadOnlyCollection<T> items, int totalCount, int pageNumber, int pageSize)
    {
        Items = items ?? Array.Empty<T>();
        TotalCount = totalCount;
        PageNumber = pageNumber;
        PageSize = pageSize;
    }
}
