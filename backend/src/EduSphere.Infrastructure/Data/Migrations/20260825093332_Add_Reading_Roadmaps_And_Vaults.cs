using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduSphere.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class Add_Reading_Roadmaps_And_Vaults : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ReadingSubmissions_Users_UserId",
                table: "ReadingSubmissions");

            migrationBuilder.DropIndex(
                name: "IX_ReadingSubmissions_UserId",
                table: "ReadingSubmissions");

            migrationBuilder.DropIndex(
                name: "IX_ReadingSubmissionAnswers_SubmissionId",
                table: "ReadingSubmissionAnswers");

            migrationBuilder.AddColumn<string>(
                name: "CollectionName",
                table: "ReadingPassages",
                type: "nvarchar(150)",
                maxLength: 150,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "IsCommunityShared",
                table: "ReadingPassages",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "SourceType",
                table: "ReadingPassages",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "TargetBandTier",
                table: "ReadingPassages",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<Guid>(
                name: "UploadedByUserId",
                table: "ReadingPassages",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "BandRoadmaps",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    BandTier = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    TargetSkillsSummary = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    TotalMilestones = table.Column<int>(type: "int", nullable: false),
                    VocabularyCount = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BandRoadmaps", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UserRoadmapProgresses",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    BandTier = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CurrentStepNumber = table.Column<int>(type: "int", nullable: false),
                    MasteryPercentage = table.Column<float>(type: "real", nullable: false),
                    CompletedPassagesCount = table.Column<int>(type: "int", nullable: false),
                    EarnedBadge = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserRoadmapProgresses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserRoadmapProgresses_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "BandMilestones",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    BandRoadmapId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StepNumber = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    TargetSkill = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    ReadingPassageId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    MinAccuracyToUnlockNext = table.Column<float>(type: "real", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BandMilestones", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BandMilestones_BandRoadmaps_BandRoadmapId",
                        column: x => x.BandRoadmapId,
                        principalTable: "BandRoadmaps",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_BandMilestones_ReadingPassages_ReadingPassageId",
                        column: x => x.ReadingPassageId,
                        principalTable: "ReadingPassages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "BandVocabularies",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    BandRoadmapId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    BandTier = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Word = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Phonetic = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Meaning = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    PartOfSpeech = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    AcademicLevel = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    ExampleSentence = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    CollocationsJson = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    SynonymsJson = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BandVocabularies", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BandVocabularies_BandRoadmaps_BandRoadmapId",
                        column: x => x.BandRoadmapId,
                        principalTable: "BandRoadmaps",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ReadingSubmissions_UserId_PassageId",
                table: "ReadingSubmissions",
                columns: new[] { "UserId", "PassageId" });

            migrationBuilder.CreateIndex(
                name: "IX_ReadingSubmissionAnswers_SubmissionId_QuestionId",
                table: "ReadingSubmissionAnswers",
                columns: new[] { "SubmissionId", "QuestionId" });

            migrationBuilder.CreateIndex(
                name: "IX_ReadingPassages_SourceType",
                table: "ReadingPassages",
                column: "SourceType");

            migrationBuilder.CreateIndex(
                name: "IX_ReadingPassages_TargetBandTier",
                table: "ReadingPassages",
                column: "TargetBandTier");

            migrationBuilder.CreateIndex(
                name: "IX_BandMilestones_BandRoadmapId_StepNumber",
                table: "BandMilestones",
                columns: new[] { "BandRoadmapId", "StepNumber" });

            migrationBuilder.CreateIndex(
                name: "IX_BandMilestones_ReadingPassageId",
                table: "BandMilestones",
                column: "ReadingPassageId");

            migrationBuilder.CreateIndex(
                name: "IX_BandRoadmaps_BandTier",
                table: "BandRoadmaps",
                column: "BandTier",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_BandVocabularies_BandRoadmapId",
                table: "BandVocabularies",
                column: "BandRoadmapId");

            migrationBuilder.CreateIndex(
                name: "IX_BandVocabularies_BandTier",
                table: "BandVocabularies",
                column: "BandTier");

            migrationBuilder.CreateIndex(
                name: "IX_BandVocabularies_Word",
                table: "BandVocabularies",
                column: "Word");

            migrationBuilder.CreateIndex(
                name: "IX_UserRoadmapProgresses_UserId_BandTier",
                table: "UserRoadmapProgresses",
                columns: new[] { "UserId", "BandTier" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_ReadingSubmissions_Users_UserId",
                table: "ReadingSubmissions",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ReadingSubmissions_Users_UserId",
                table: "ReadingSubmissions");

            migrationBuilder.DropTable(
                name: "BandMilestones");

            migrationBuilder.DropTable(
                name: "BandVocabularies");

            migrationBuilder.DropTable(
                name: "UserRoadmapProgresses");

            migrationBuilder.DropTable(
                name: "BandRoadmaps");

            migrationBuilder.DropIndex(
                name: "IX_ReadingSubmissions_UserId_PassageId",
                table: "ReadingSubmissions");

            migrationBuilder.DropIndex(
                name: "IX_ReadingSubmissionAnswers_SubmissionId_QuestionId",
                table: "ReadingSubmissionAnswers");

            migrationBuilder.DropIndex(
                name: "IX_ReadingPassages_SourceType",
                table: "ReadingPassages");

            migrationBuilder.DropIndex(
                name: "IX_ReadingPassages_TargetBandTier",
                table: "ReadingPassages");

            migrationBuilder.DropColumn(
                name: "CollectionName",
                table: "ReadingPassages");

            migrationBuilder.DropColumn(
                name: "IsCommunityShared",
                table: "ReadingPassages");

            migrationBuilder.DropColumn(
                name: "SourceType",
                table: "ReadingPassages");

            migrationBuilder.DropColumn(
                name: "TargetBandTier",
                table: "ReadingPassages");

            migrationBuilder.DropColumn(
                name: "UploadedByUserId",
                table: "ReadingPassages");

            migrationBuilder.CreateIndex(
                name: "IX_ReadingSubmissions_UserId",
                table: "ReadingSubmissions",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_ReadingSubmissionAnswers_SubmissionId",
                table: "ReadingSubmissionAnswers",
                column: "SubmissionId");

            migrationBuilder.AddForeignKey(
                name: "FK_ReadingSubmissions_Users_UserId",
                table: "ReadingSubmissions",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
