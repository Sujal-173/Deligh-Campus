"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { studentLearningService } from "@/services/student/learning.service";
import type { Course } from "@/types/student";
import {
  Search,
  Star,
  BookOpen,
  Clock,
  Award,
  Check,
  ChevronDown,
} from "lucide-react";

function matchesCategory(course: Course, category: string) {
  if (category === "All Categories") return true;
  return course.category?.toLowerCase() === category.toLowerCase();
}

export default function CourseBrowser({
  initialCourses,
}: {
  initialCourses: Course[];
}) {
  const [courses, setCourses] = useState(initialCourses);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const categories = useMemo(
    () => [
      "All Categories",
      ...Array.from(
        new Set(
          courses
            .map((course) => course.category)
            .filter((value): value is string => Boolean(value)),
        ),
      ),
    ],
    [courses],
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [enrollingId, setEnrollingId] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      courses.filter(
        (c) =>
          matchesCategory(c, category) &&
          (search.trim() === "" ||
            c.title.toLowerCase().includes(search.trim().toLowerCase())),
      ),
    [courses, search, category],
  );

  async function handleEnroll(course: Course) {
    if (course.enrolled) {
      toast.info(`Already enrolled — jumping back into ${course.title}.`);
      return;
    }
    setEnrollingId(course.id);
    try {
      // Spring Boot: POST /api/student/courses/{courseId}/enroll — already
      // defined in services/student/learning.service.ts.
      await studentLearningService.enroll(course.id);
      setCourses((prev) =>
        prev.map((c) => (c.id === course.id ? { ...c, enrolled: true } : c)),
      );
      toast.success(`Enrolled in ${course.title}!`);
    } catch {
      toast.error("Couldn't enroll right now — try again.");
    } finally {
      setEnrollingId(null);
    }
  }

  return (
    <>
      <Card className="p-5">
        <h2 className="mb-3 font-semibold text-primary">Browse Courses</h2>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-grey-50" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses…"
              className="w-full rounded-lg border border-grey-20 py-2.5 pl-9 pr-3 text-sm text-primary placeholder:text-grey-50 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-10"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-lg border border-grey-20 px-3 py-2.5 text-sm text-primary focus:border-secondary focus:outline-none"
          >
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
      </Card>

      <div>
        <h2 className="mb-3 mt-6 font-semibold text-primary">
          Courses{" "}
          {filtered.length !== courses.length && (
            <span className="font-normal text-grey-50">
              ({filtered.length} of {courses.length})
            </span>
          )}
        </h2>

        {filtered.length === 0 && (
          <Card className="p-8 text-center text-sm text-grey-50">
            No courses match your search.
          </Card>
        )}

        <div className="space-y-4">
          {filtered.map((course) => {
            const expanded = expandedId === course.id;
            return (
              <Card
                key={course.id}
                className="grid gap-5 p-5 lg:grid-cols-[220px_1fr_280px]"
              >
                <div className="aspect-video w-full rounded-xl bg-deligh-gradient" />

                <div>
                  <h3 className="font-display text-lg font-bold text-primary">
                    {course.title}
                  </h3>
                  <p className="text-sm text-grey-60">{course.level}</p>
                  <div className="mt-1 flex items-center gap-1 text-sm">
                    <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                    <span className="font-medium text-primary">
                      {course.rating}
                    </span>
                    <span className="text-grey-50">
                      ({(course.reviewCount / 1000).toFixed(1)}k reviews)
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-grey-70">
                    {course.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-grey-60">
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5" /> {course.chapterCount}{" "}
                      Chapters
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {course.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Award className="h-3.5 w-3.5" /> {course.certificateEta}
                    </span>
                  </div>

                  {expanded && (
                    <div className="mt-4 rounded-xl border border-grey-20 p-4">
                      <p className="mb-2 text-sm font-semibold text-primary">
                        Full Curriculum
                      </p>
                      <ul className="space-y-1.5 text-sm text-grey-70">
                        {course.learningOutcomes.map((item, i) => (
                          <li key={item} className="flex items-center gap-2">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary-10 text-[10px] font-semibold text-secondary-90">
                              {i + 1}
                            </span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="rounded-xl bg-grey-10 p-4">
                  <p className="mb-2 text-sm font-semibold text-primary">
                    What you&apos;ll learn
                  </p>
                  <ul className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-xs text-grey-70">
                    {course.learningOutcomes.slice(0, 6).map((item) => (
                      <li key={item} className="flex items-start gap-1.5">
                        <Check className="mt-0.5 h-3 w-3 shrink-0 text-success" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setExpandedId(expanded ? null : course.id)}
                    >
                      {expanded ? "Hide Details" : "View Details"}
                      <ChevronDown
                        className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
                      />
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEnroll(course)}
                      disabled={enrollingId === course.id}
                    >
                      {enrollingId === course.id
                        ? "Enrolling…"
                        : course.enrolled
                          ? "Continue"
                          : "Enroll Now"}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
}
