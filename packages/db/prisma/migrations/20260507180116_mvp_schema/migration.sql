-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CourseVersion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "courseId" TEXT NOT NULL,
    "versionLabel" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "schemaVersion" TEXT NOT NULL,
    "sourceRepo" TEXT,
    "sourceRef" TEXT,
    "publishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CourseVersion_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Module" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "courseVersionId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "overview" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Module_courseVersionId_fkey" FOREIGN KEY ("courseVersionId") REFERENCES "CourseVersion" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Lesson" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "moduleId" TEXT NOT NULL,
    "stableId" TEXT NOT NULL,
    "lessonNumber" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "overview" TEXT,
    "summary" TEXT,
    "schemaRef" TEXT,
    "contentVersion" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Lesson_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ContentBlock" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lessonId" TEXT NOT NULL,
    "stableId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'content_block',
    "title" TEXT,
    "body" TEXT NOT NULL,
    "caseId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ContentBlock_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ContentBlock_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Interaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lessonId" TEXT NOT NULL,
    "stableId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "title" TEXT,
    "prompt" TEXT NOT NULL,
    "body" TEXT,
    "caseId" TEXT,
    "scoringMode" TEXT NOT NULL,
    "points" REAL NOT NULL DEFAULT 0,
    "gradingPrompt" TEXT,
    "answerKey" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Interaction_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Interaction_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InteractionOption" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "interactionId" TEXT NOT NULL,
    "stableId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "label" TEXT,
    "text" TEXT NOT NULL,
    "value" TEXT,
    "isCorrect" BOOLEAN,
    "feedback" TEXT,
    CONSTRAINT "InteractionOption_interactionId_fkey" FOREIGN KEY ("interactionId") REFERENCES "Interaction" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Case" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "courseVersionId" TEXT NOT NULL,
    "stableId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "primaryUse" TEXT,
    "content" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Case_courseVersionId_fkey" FOREIGN KEY ("courseVersionId") REFERENCES "CourseVersion" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Rubric" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "courseVersionId" TEXT NOT NULL,
    "interactionId" TEXT,
    "stableId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "criteria" TEXT NOT NULL,
    "scoringPrompt" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Rubric_courseVersionId_fkey" FOREIGN KEY ("courseVersionId") REFERENCES "CourseVersion" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Rubric_interactionId_fkey" FOREIGN KEY ("interactionId") REFERENCES "Interaction" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "externalId" TEXT,
    "email" TEXT,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'student',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Enrollment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "courseId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'student',
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Enrollment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Enrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Launch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "platformId" TEXT,
    "deploymentId" TEXT,
    "lineItemId" TEXT,
    "contextId" TEXT,
    "resourceLinkId" TEXT,
    "nonce" TEXT,
    "launchData" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Launch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Launch_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "LtiPlatform" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Launch_deploymentId_fkey" FOREIGN KEY ("deploymentId") REFERENCES "LtiDeployment" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Launch_lineItemId_fkey" FOREIGN KEY ("lineItemId") REFERENCES "LtiLineItem" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Attempt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lessonId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "enrollmentId" TEXT,
    "sourceLaunchId" TEXT,
    "attemptNumber" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" DATETIME,
    "lockedAt" DATETIME,
    "totalScore" REAL,
    "maxScore" REAL,
    CONSTRAINT "Attempt_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Attempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Attempt_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Attempt_sourceLaunchId_fkey" FOREIGN KEY ("sourceLaunchId") REFERENCES "Launch" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Response" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "attemptId" TEXT NOT NULL,
    "interactionId" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "isSubmitted" BOOLEAN NOT NULL DEFAULT false,
    "submittedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Response_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "Attempt" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Response_interactionId_fkey" FOREIGN KEY ("interactionId") REFERENCES "Interaction" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GradeResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "attemptId" TEXT NOT NULL,
    "interactionId" TEXT,
    "status" TEXT NOT NULL,
    "score" REAL NOT NULL,
    "maxScore" REAL NOT NULL,
    "feedback" TEXT,
    "grader" TEXT,
    "gradedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GradeResult_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "Attempt" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GradeResult_interactionId_fkey" FOREIGN KEY ("interactionId") REFERENCES "Interaction" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GradePassbackLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "attemptId" TEXT NOT NULL,
    "lineItemId" TEXT,
    "status" TEXT NOT NULL,
    "scoreGiven" REAL,
    "scoreMaximum" REAL,
    "requestBody" TEXT,
    "responseBody" TEXT,
    "error" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GradePassbackLog_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "Attempt" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GradePassbackLog_lineItemId_fkey" FOREIGN KEY ("lineItemId") REFERENCES "LtiLineItem" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LtiPlatform" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "issuer" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "authLoginUrl" TEXT,
    "authTokenUrl" TEXT,
    "jwksUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "LtiDeployment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "platformId" TEXT NOT NULL,
    "deploymentId" TEXT NOT NULL,
    "name" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LtiDeployment_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "LtiPlatform" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LtiRegistration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "platformId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "keySetUrl" TEXT,
    "authLoginUrl" TEXT,
    "authTokenUrl" TEXT,
    "privateKeyRef" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LtiRegistration_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "LtiPlatform" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LtiLineItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "deploymentId" TEXT NOT NULL,
    "courseId" TEXT,
    "lessonId" TEXT,
    "lineItemUrl" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "maxScore" REAL NOT NULL,
    "tag" TEXT,
    "resourceId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LtiLineItem_deploymentId_fkey" FOREIGN KEY ("deploymentId") REFERENCES "LtiDeployment" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LtiLineItem_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "LtiLineItem_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PublishRun" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "courseVersionId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "sourceSummary" TEXT,
    "log" TEXT,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" DATETIME,
    CONSTRAINT "PublishRun_courseVersionId_fkey" FOREIGN KEY ("courseVersionId") REFERENCES "CourseVersion" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "actorUserId" TEXT,
    "eventType" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditEvent_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Course_slug_key" ON "Course"("slug");

-- CreateIndex
CREATE INDEX "CourseVersion_courseId_status_idx" ON "CourseVersion"("courseId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "CourseVersion_courseId_versionLabel_key" ON "CourseVersion"("courseId", "versionLabel");

-- CreateIndex
CREATE UNIQUE INDEX "Module_courseVersionId_number_key" ON "Module"("courseVersionId", "number");

-- CreateIndex
CREATE UNIQUE INDEX "Module_courseVersionId_slug_key" ON "Module"("courseVersionId", "slug");

-- CreateIndex
CREATE INDEX "Lesson_moduleId_slug_idx" ON "Lesson"("moduleId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Lesson_moduleId_stableId_key" ON "Lesson"("moduleId", "stableId");

-- CreateIndex
CREATE UNIQUE INDEX "Lesson_moduleId_lessonNumber_key" ON "Lesson"("moduleId", "lessonNumber");

-- CreateIndex
CREATE INDEX "ContentBlock_lessonId_sortOrder_idx" ON "ContentBlock"("lessonId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "ContentBlock_lessonId_stableId_key" ON "ContentBlock"("lessonId", "stableId");

-- CreateIndex
CREATE INDEX "Interaction_lessonId_sortOrder_idx" ON "Interaction"("lessonId", "sortOrder");

-- CreateIndex
CREATE INDEX "Interaction_kind_idx" ON "Interaction"("kind");

-- CreateIndex
CREATE UNIQUE INDEX "Interaction_lessonId_stableId_key" ON "Interaction"("lessonId", "stableId");

-- CreateIndex
CREATE INDEX "InteractionOption_interactionId_sortOrder_idx" ON "InteractionOption"("interactionId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "InteractionOption_interactionId_stableId_key" ON "InteractionOption"("interactionId", "stableId");

-- CreateIndex
CREATE UNIQUE INDEX "Case_courseVersionId_stableId_key" ON "Case"("courseVersionId", "stableId");

-- CreateIndex
CREATE INDEX "Rubric_interactionId_idx" ON "Rubric"("interactionId");

-- CreateIndex
CREATE UNIQUE INDEX "Rubric_courseVersionId_stableId_key" ON "Rubric"("courseVersionId", "stableId");

-- CreateIndex
CREATE UNIQUE INDEX "User_externalId_key" ON "User"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Enrollment_userId_idx" ON "Enrollment"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_courseId_userId_key" ON "Enrollment"("courseId", "userId");

-- CreateIndex
CREATE INDEX "Launch_userId_createdAt_idx" ON "Launch"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Launch_deploymentId_contextId_idx" ON "Launch"("deploymentId", "contextId");

-- CreateIndex
CREATE INDEX "Attempt_userId_status_idx" ON "Attempt"("userId", "status");

-- CreateIndex
CREATE INDEX "Attempt_lessonId_status_idx" ON "Attempt"("lessonId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Attempt_lessonId_userId_attemptNumber_key" ON "Attempt"("lessonId", "userId", "attemptNumber");

-- CreateIndex
CREATE INDEX "Response_interactionId_idx" ON "Response"("interactionId");

-- CreateIndex
CREATE UNIQUE INDEX "Response_attemptId_interactionId_key" ON "Response"("attemptId", "interactionId");

-- CreateIndex
CREATE INDEX "GradeResult_attemptId_gradedAt_idx" ON "GradeResult"("attemptId", "gradedAt");

-- CreateIndex
CREATE INDEX "GradeResult_interactionId_idx" ON "GradeResult"("interactionId");

-- CreateIndex
CREATE INDEX "GradePassbackLog_attemptId_createdAt_idx" ON "GradePassbackLog"("attemptId", "createdAt");

-- CreateIndex
CREATE INDEX "GradePassbackLog_lineItemId_idx" ON "GradePassbackLog"("lineItemId");

-- CreateIndex
CREATE UNIQUE INDEX "LtiPlatform_issuer_key" ON "LtiPlatform"("issuer");

-- CreateIndex
CREATE UNIQUE INDEX "LtiDeployment_platformId_deploymentId_key" ON "LtiDeployment"("platformId", "deploymentId");

-- CreateIndex
CREATE UNIQUE INDEX "LtiRegistration_platformId_clientId_key" ON "LtiRegistration"("platformId", "clientId");

-- CreateIndex
CREATE INDEX "LtiLineItem_courseId_idx" ON "LtiLineItem"("courseId");

-- CreateIndex
CREATE INDEX "LtiLineItem_lessonId_idx" ON "LtiLineItem"("lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "LtiLineItem_deploymentId_lineItemUrl_key" ON "LtiLineItem"("deploymentId", "lineItemUrl");

-- CreateIndex
CREATE INDEX "PublishRun_courseVersionId_startedAt_idx" ON "PublishRun"("courseVersionId", "startedAt");

-- CreateIndex
CREATE INDEX "AuditEvent_actorUserId_createdAt_idx" ON "AuditEvent"("actorUserId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditEvent_entityType_entityId_idx" ON "AuditEvent"("entityType", "entityId");
