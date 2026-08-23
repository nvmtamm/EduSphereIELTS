using System.Text.RegularExpressions;

namespace EduSphere.Domain.ValueObjects;

public sealed class Email : IEquatable<Email>
{
    private static readonly Regex EmailRegex = new(
        @"^[^@\s]+@[^@\s]+\.[^@\s]+$",
        RegexOptions.Compiled | RegexOptions.IgnoreCase);

    public string Value { get; }

    private Email(string value)
    {
        Value = value;
    }

    public static Email Create(string? email)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            throw new ArgumentException("Email address cannot be empty.", nameof(email));
        }

        var trimmed = email.Trim().ToLowerInvariant();

        if (!EmailRegex.IsMatch(trimmed))
        {
            throw new ArgumentException("Email format is invalid.", nameof(email));
        }

        return new Email(trimmed);
    }

    public static bool TryCreate(string? email, out Email? result)
    {
        result = null;
        if (string.IsNullOrWhiteSpace(email))
        {
            return false;
        }

        var trimmed = email.Trim().ToLowerInvariant();
        if (!EmailRegex.IsMatch(trimmed))
        {
            return false;
        }

        result = new Email(trimmed);
        return true;
    }

    public override string ToString() => Value;

    public bool Equals(Email? other)
    {
        if (other is null) return false;
        if (ReferenceEquals(this, other)) return true;
        return string.Equals(Value, other.Value, StringComparison.OrdinalIgnoreCase);
    }

    public override bool Equals(object? obj) => obj is Email other && Equals(other);

    public override int GetHashCode() => StringComparer.OrdinalIgnoreCase.GetHashCode(Value);

    public static bool operator ==(Email? left, Email? right) => Equals(left, right);
    public static bool operator !=(Email? left, Email? right) => !Equals(left, right);
}
