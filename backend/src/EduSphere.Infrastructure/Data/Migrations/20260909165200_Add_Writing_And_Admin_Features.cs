using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduSphere.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class Add_Writing_And_Admin_Features : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "Users",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.CreateTable(
                name: "WritingPrompts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TaskType = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Title = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    Topic = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    PromptText = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ImageUrl = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Difficulty = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    RecommendedTimeMinutes = table.Column<int>(type: "int", nullable: false, defaultValue: 40),
                    MinWordCount = table.Column<int>(type: "int", nullable: false, defaultValue: 250),
                    SampleBand8Answer = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    UploadedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WritingPrompts", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WritingSubmissions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PromptId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    WordCount = table.Column<int>(type: "int", nullable: false),
                    TimeSpentSeconds = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    TaskAchievementScore = table.Column<float>(type: "real", nullable: false, defaultValue: 0f),
                    CoherenceCohesionScore = table.Column<float>(type: "real", nullable: false, defaultValue: 0f),
                    LexicalResourceScore = table.Column<float>(type: "real", nullable: false, defaultValue: 0f),
                    GrammaticalRangeScore = table.Column<float>(type: "real", nullable: false, defaultValue: 0f),
                    OverallBandScore = table.Column<float>(type: "real", nullable: false, defaultValue: 0f),
                    CriteriaBreakdownJson = table.Column<string>(type: "nvarchar(max)", nullable: false, defaultValue: "{}"),
                    GrammarErrorsJson = table.Column<string>(type: "nvarchar(max)", nullable: false, defaultValue: "[]"),
                    VocabularySuggestionsJson = table.Column<string>(type: "nvarchar(max)", nullable: false, defaultValue: "[]"),
                    GeneralFeedback = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WritingSubmissions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WritingSubmissions_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WritingSubmissions_WritingPrompts_PromptId",
                        column: x => x.PromptId,
                        principalTable: "WritingPrompts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_WritingPrompts_TaskType",
                table: "WritingPrompts",
                column: "TaskType");

            migrationBuilder.CreateIndex(
                name: "IX_WritingPrompts_Topic",
                table: "WritingPrompts",
                column: "Topic");

            migrationBuilder.CreateIndex(
                name: "IX_WritingSubmissions_PromptId",
                table: "WritingSubmissions",
                column: "PromptId");

            migrationBuilder.CreateIndex(
                name: "IX_WritingSubmissions_UserId",
                table: "WritingSubmissions",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "WritingSubmissions");

            migrationBuilder.DropTable(
                name: "WritingPrompts");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "Users");
        }
    }
}
