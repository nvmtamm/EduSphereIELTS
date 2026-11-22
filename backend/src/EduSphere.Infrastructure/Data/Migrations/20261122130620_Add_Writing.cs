using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduSphere.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class Add_Writing : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "WritingPrompts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TaskType = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    EssayType = table.Column<string>(type: "nvarchar(60)", maxLength: 60, nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Topic = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    PromptText = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DataText = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MinWords = table.Column<int>(type: "int", nullable: false),
                    SuggestedMinutes = table.Column<int>(type: "int", nullable: false),
                    Outline = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ModelEssay = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ModelBand = table.Column<decimal>(type: "decimal(3,1)", precision: 3, scale: 1, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
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
                    Essay = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    WordCount = table.Column<int>(type: "int", nullable: false),
                    DurationSeconds = table.Column<int>(type: "int", nullable: false),
                    TaskResponse = table.Column<decimal>(type: "decimal(3,1)", precision: 3, scale: 1, nullable: false),
                    CoherenceCohesion = table.Column<decimal>(type: "decimal(3,1)", precision: 3, scale: 1, nullable: false),
                    LexicalResource = table.Column<decimal>(type: "decimal(3,1)", precision: 3, scale: 1, nullable: false),
                    GrammaticalRange = table.Column<decimal>(type: "decimal(3,1)", precision: 3, scale: 1, nullable: false),
                    OverallBand = table.Column<decimal>(type: "decimal(3,1)", precision: 3, scale: 1, nullable: false),
                    FeedbackJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WritingSubmissions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WritingSubmissions_WritingPrompts_PromptId",
                        column: x => x.PromptId,
                        principalTable: "WritingPrompts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_WritingSubmissions_PromptId",
                table: "WritingSubmissions",
                column: "PromptId");

            migrationBuilder.CreateIndex(
                name: "IX_WritingSubmissions_UserId_CreatedAt",
                table: "WritingSubmissions",
                columns: new[] { "UserId", "CreatedAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "WritingSubmissions");

            migrationBuilder.DropTable(
                name: "WritingPrompts");
        }
    }
}
