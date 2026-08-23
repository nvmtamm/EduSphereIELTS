namespace EduSphere.Domain.Common;

public interface IDomainEvent
{
    DateTime OccurredOn { get; }
}
