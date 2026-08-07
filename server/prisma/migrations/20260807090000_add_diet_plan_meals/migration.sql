-- CreateTable
CREATE TABLE "diet_plan_meals" (
    "id" UUID NOT NULL,
    "diet_plan_id" UUID NOT NULL,
    "day_index" INTEGER NOT NULL,
    "type" TEXT,
    "calories" INTEGER,
    "items_json" TEXT NOT NULL,

    CONSTRAINT "diet_plan_meals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "diet_plan_meals_diet_plan_id_idx" ON "diet_plan_meals"("diet_plan_id");

-- AddForeignKey
ALTER TABLE "diet_plan_meals" ADD CONSTRAINT "diet_plan_meals_diet_plan_id_fkey" FOREIGN KEY ("diet_plan_id") REFERENCES "diet_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;
