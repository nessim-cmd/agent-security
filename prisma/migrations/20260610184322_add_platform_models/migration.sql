-- CreateTable
CREATE TABLE "Target" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "endpoint" TEXT,
    "provider" TEXT,
    "model" TEXT,
    "apiKey" TEXT,
    "headers" JSONB,
    "templateId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Target_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workflow" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "targetId" TEXT NOT NULL,
    "mode" TEXT NOT NULL DEFAULT 'manual',
    "attackCategories" JSONB,
    "status" TEXT NOT NULL DEFAULT 'idle',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowRun" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'running',
    "securityScore" INTEGER,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "WorkflowRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttackRun" (
    "id" TEXT NOT NULL,
    "workflowRunId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "owaspCategory" TEXT NOT NULL,
    "attackName" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "response" TEXT,
    "success" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AttackRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Finding" (
    "id" TEXT NOT NULL,
    "workflowRunId" TEXT NOT NULL,
    "attackRunId" TEXT,
    "title" TEXT NOT NULL,
    "owaspCategory" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "confidence" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "evidence" TEXT,
    "recommendation" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Finding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ThreatModel" (
    "id" TEXT NOT NULL,
    "workflowRunId" TEXT NOT NULL,
    "targetName" TEXT,
    "domain" TEXT,
    "tools" JSONB,
    "risks" JSONB,
    "rawOutput" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ThreatModel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Target_type_idx" ON "Target"("type");

-- CreateIndex
CREATE INDEX "Workflow_targetId_idx" ON "Workflow"("targetId");

-- CreateIndex
CREATE INDEX "WorkflowRun_workflowId_idx" ON "WorkflowRun"("workflowId");

-- CreateIndex
CREATE INDEX "AttackRun_workflowRunId_idx" ON "AttackRun"("workflowRunId");

-- CreateIndex
CREATE INDEX "AttackRun_owaspCategory_idx" ON "AttackRun"("owaspCategory");

-- CreateIndex
CREATE UNIQUE INDEX "Finding_attackRunId_key" ON "Finding"("attackRunId");

-- CreateIndex
CREATE INDEX "Finding_workflowRunId_idx" ON "Finding"("workflowRunId");

-- CreateIndex
CREATE INDEX "Finding_severity_idx" ON "Finding"("severity");

-- CreateIndex
CREATE UNIQUE INDEX "ThreatModel_workflowRunId_key" ON "ThreatModel"("workflowRunId");

-- AddForeignKey
ALTER TABLE "Workflow" ADD CONSTRAINT "Workflow_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "Target"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowRun" ADD CONSTRAINT "WorkflowRun_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttackRun" ADD CONSTRAINT "AttackRun_workflowRunId_fkey" FOREIGN KEY ("workflowRunId") REFERENCES "WorkflowRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttackRun" ADD CONSTRAINT "AttackRun_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "Target"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Finding" ADD CONSTRAINT "Finding_workflowRunId_fkey" FOREIGN KEY ("workflowRunId") REFERENCES "WorkflowRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Finding" ADD CONSTRAINT "Finding_attackRunId_fkey" FOREIGN KEY ("attackRunId") REFERENCES "AttackRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThreatModel" ADD CONSTRAINT "ThreatModel_workflowRunId_fkey" FOREIGN KEY ("workflowRunId") REFERENCES "WorkflowRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
