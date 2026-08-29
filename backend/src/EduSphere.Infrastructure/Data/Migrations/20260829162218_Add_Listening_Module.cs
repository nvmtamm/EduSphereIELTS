using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduSphere.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class Add_Listening_Module : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ListeningTests",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    Topic = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Difficulty = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    SectionType = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    SectionNumber = table.Column<int>(type: "int", nullable: false),
                    AudioUrl = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    DurationSeconds = table.Column<int>(type: "int", nullable: false),
                    AudioFileSize = table.Column<long>(type: "bigint", nullable: false),
                    Accent = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    SourceType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CollectionName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    TargetBandTier = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Instructions = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    UploadedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsCommunityShared = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ListeningTests", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ListeningQuestions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TestId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SectionNumber = table.Column<int>(type: "int", nullable: false),
                    QuestionNumber = table.Column<int>(type: "int", nullable: false),
                    QuestionType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Prompt = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OptionsJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CorrectAnswer = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Explanation = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    TimestampSeconds = table.Column<double>(type: "float", nullable: false),
                    AudioTimestampEndSeconds = table.Column<double>(type: "float", nullable: true),
                    DiagramImageUrl = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ListeningQuestions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ListeningQuestions_ListeningTests_TestId",
                        column: x => x.TestId,
                        principalTable: "ListeningTests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ListeningSubmissions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TestId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RawScore = table.Column<int>(type: "int", nullable: false),
                    TotalQuestions = table.Column<int>(type: "int", nullable: false),
                    BandScore = table.Column<double>(type: "float", nullable: false),
                    DurationSeconds = table.Column<int>(type: "int", nullable: false),
                    BreakdownJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ListeningSubmissions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ListeningSubmissions_ListeningTests_TestId",
                        column: x => x.TestId,
                        principalTable: "ListeningTests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ListeningSubmissions_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ListeningTranscripts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TestId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SectionNumber = table.Column<int>(type: "int", nullable: false),
                    StartTimeSeconds = table.Column<double>(type: "float", nullable: false),
                    EndTimeSeconds = table.Column<double>(type: "float", nullable: false),
                    Speaker = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    TextContent = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LinkedQuestionNumber = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ListeningTranscripts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ListeningTranscripts_ListeningTests_TestId",
                        column: x => x.TestId,
                        principalTable: "ListeningTests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ListeningSubmissionAnswers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SubmissionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    QuestionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserAnswer = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    IsCorrect = table.Column<bool>(type: "bit", nullable: false),
                    CorrectAnswer = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ListeningSubmissionAnswers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ListeningSubmissionAnswers_ListeningQuestions_QuestionId",
                        column: x => x.QuestionId,
                        principalTable: "ListeningQuestions",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ListeningSubmissionAnswers_ListeningSubmissions_SubmissionId",
                        column: x => x.SubmissionId,
                        principalTable: "ListeningSubmissions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ListeningQuestions_TestId_QuestionNumber",
                table: "ListeningQuestions",
                columns: new[] { "TestId", "QuestionNumber" });

            migrationBuilder.CreateIndex(
                name: "IX_ListeningQuestions_TestId_SectionNumber",
                table: "ListeningQuestions",
                columns: new[] { "TestId", "SectionNumber" });

            migrationBuilder.CreateIndex(
                name: "IX_ListeningSubmissionAnswers_QuestionId",
                table: "ListeningSubmissionAnswers",
                column: "QuestionId");

            migrationBuilder.CreateIndex(
                name: "IX_ListeningSubmissionAnswers_SubmissionId_QuestionId",
                table: "ListeningSubmissionAnswers",
                columns: new[] { "SubmissionId", "QuestionId" });

            migrationBuilder.CreateIndex(
                name: "IX_ListeningSubmissions_TestId",
                table: "ListeningSubmissions",
                column: "TestId");

            migrationBuilder.CreateIndex(
                name: "IX_ListeningSubmissions_UserId_CreatedAt",
                table: "ListeningSubmissions",
                columns: new[] { "UserId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_ListeningTests_Accent",
                table: "ListeningTests",
                column: "Accent");

            migrationBuilder.CreateIndex(
                name: "IX_ListeningTests_CollectionName",
                table: "ListeningTests",
                column: "CollectionName");

            migrationBuilder.CreateIndex(
                name: "IX_ListeningTests_SectionNumber_Difficulty",
                table: "ListeningTests",
                columns: new[] { "SectionNumber", "Difficulty" });

            migrationBuilder.CreateIndex(
                name: "IX_ListeningTranscripts_TestId_StartTimeSeconds",
                table: "ListeningTranscripts",
                columns: new[] { "TestId", "StartTimeSeconds" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ListeningSubmissionAnswers");

            migrationBuilder.DropTable(
                name: "ListeningTranscripts");

            migrationBuilder.DropTable(
                name: "ListeningQuestions");

            migrationBuilder.DropTable(
                name: "ListeningSubmissions");

            migrationBuilder.DropTable(
                name: "ListeningTests");
        }
    }
}
