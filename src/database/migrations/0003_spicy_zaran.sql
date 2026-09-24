ALTER TABLE "tenant_workspaces" ALTER COLUMN "max_member_limit_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "tenant_workspaces" ADD COLUMN "workspace_nombre" varchar(100) NOT NULL;