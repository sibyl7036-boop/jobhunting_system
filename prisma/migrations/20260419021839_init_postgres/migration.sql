-- CreateTable
CREATE TABLE "Resume" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "extractedText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resume_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "departmentName" TEXT NOT NULL,
    "roleName" TEXT NOT NULL,
    "jdText" TEXT,
    "jdSummary" TEXT,
    "jdKeywords" TEXT,
    "expectedSkills" TEXT,
    "interviewQuestions" TEXT,
    "linkedResumeId" TEXT,
    "currentStatus" TEXT NOT NULL DEFAULT '未投递',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stage" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "time" TIMESTAMP(3),
    "meetingLink" TEXT,
    "status" TEXT NOT NULL DEFAULT '待参加',
    "reviewQuestionSummary" TEXT,
    "reviewAnswerSummary" TEXT,
    "reviewSuggestion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIRun" (
    "id" TEXT NOT NULL,
    "taskType" TEXT NOT NULL,
    "inputText" TEXT NOT NULL,
    "outputText" TEXT NOT NULL,
    "outputJson" TEXT,
    "status" TEXT NOT NULL,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntelSummary" (
    "id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "summaryText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntelSummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TomorrowTipCache" (
    "id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "tipText" TEXT NOT NULL,
    "eventsHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TomorrowTipCache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Application_companyName_idx" ON "Application"("companyName");

-- CreateIndex
CREATE INDEX "Application_linkedResumeId_idx" ON "Application"("linkedResumeId");

-- CreateIndex
CREATE INDEX "Stage_applicationId_idx" ON "Stage"("applicationId");

-- CreateIndex
CREATE INDEX "Stage_time_idx" ON "Stage"("time");

-- CreateIndex
CREATE INDEX "AIRun_taskType_createdAt_idx" ON "AIRun"("taskType", "createdAt");

-- CreateIndex
CREATE INDEX "AIRun_status_idx" ON "AIRun"("status");

-- CreateIndex
CREATE UNIQUE INDEX "IntelSummary_date_key" ON "IntelSummary"("date");

-- CreateIndex
CREATE UNIQUE INDEX "TomorrowTipCache_date_key" ON "TomorrowTipCache"("date");

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_linkedResumeId_fkey" FOREIGN KEY ("linkedResumeId") REFERENCES "Resume"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stage" ADD CONSTRAINT "Stage_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;
