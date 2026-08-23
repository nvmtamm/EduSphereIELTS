# Stage 1: Build & Publish
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copy csproj files and restore dependencies
COPY ["src/EduSphere.Domain/EduSphere.Domain.csproj", "src/EduSphere.Domain/"]
COPY ["src/EduSphere.Application/EduSphere.Application.csproj", "src/EduSphere.Application/"]
COPY ["src/EduSphere.Infrastructure/EduSphere.Infrastructure.csproj", "src/EduSphere.Infrastructure/"]
COPY ["src/EduSphere.Shared/EduSphere.Shared.csproj", "src/EduSphere.Shared/"]
COPY ["src/EduSphere.API/EduSphere.API.csproj", "src/EduSphere.API/"]

RUN dotnet restore "src/EduSphere.API/EduSphere.API.csproj"

# Copy source code and build release
COPY . .
WORKDIR "/app/src/EduSphere.API"
RUN dotnet publish "EduSphere.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Runtime Image (Optimized & Secure)
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "EduSphere.API.dll"]
