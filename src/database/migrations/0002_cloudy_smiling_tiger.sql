ALTER TABLE "members_data" ADD PRIMARY KEY ("user_id");--> statement-breakpoint
ALTER TABLE "members_data" ALTER COLUMN "user_id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "tenant_workspaces" ADD PRIMARY KEY ("workspace_id");--> statement-breakpoint
ALTER TABLE "tenant_workspaces" ALTER COLUMN "workspace_id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "tenant_workspaces" ADD COLUMN "max_member_limit_id" integer;--> statement-breakpoint
ALTER TABLE "tenant_workspaces" ADD COLUMN "capacity" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "tenant_workspaces" ADD COLUMN "status" "status" DEFAULT 'ACTIVE' NOT NULL;--> statement-breakpoint
ALTER TABLE "workspace_details" DROP COLUMN "created_at";