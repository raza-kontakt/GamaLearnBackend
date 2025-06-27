import prisma from "../libs/prisma";

export async function getExamSubmissionsService({
  lang,
  filter,
  page = 1,
  limit = 10,
}: {
  lang: string;
  filter: any;
  page?: number;
  limit?: number;
}) {
  const skip = (page - 1) * limit;

  const [submissions, totalCount, responseFilters] = await Promise.all([
    prisma.examSubmission.findMany({
      where: filter,
      skip,
      take: limit,
      include: {
        student: {
          include: {
            translations: {
              where: { lang },
              select: { fullName: true },
            },
          },
        },
        assessment: {
          include: {
            area: {
              include: {
                translations: {
                  where: { lang },
                  select: { name: true, id: true },
                },
              },
            },
            translations: {
              where: { lang },
              select: { name: true },
            },
          },
        },
      },
    }),
    prisma.examSubmission.count({ where: filter }),
    getExamSubmissionFiltersService(lang),
  ]);

  const result = submissions.map((s: any) => {
    const submission = {
      ...s,
      student: s.student
        ? {
            ...s.student,
            fullName:
              Array.isArray(s.student.translations) &&
              s.student.translations[0]?.fullName
                ? s.student.translations[0].fullName
                : s.student.fullName,
          }
        : undefined,
      assessment: s.assessment
        ? {
            ...s.assessment,
            name:
              Array.isArray(s.assessment.translations) &&
              s.assessment.translations[0]?.name
                ? s.assessment.translations[0].name
                : s.assessment.name,
            area: s.assessment.area
              ? {
                  ...s.assessment.area,
                  name:
                    Array.isArray(s.assessment.area.translations) &&
                    s.assessment.area.translations[0]?.name
                      ? s.assessment.area.translations[0].name
                      : s.assessment.area.name,
                }
              : undefined,
          }
        : undefined,
    };
    if (submission.student) delete submission.student.translations;
    if (submission.assessment) {
      delete submission.assessment.translations;
      if (submission.assessment.area) {
        delete submission.assessment.area.translations;
      }
    }
    return submission;
  });

  return {
    data: result,
    filters: responseFilters,
    pagination: {
      page,
      limit,
      total: totalCount,
      totalPages: Math.ceil(totalCount / limit),
    },
  };
}

export async function getExamSubmissionFiltersService(
  lang: string,
  filters: {
    student?: boolean;
    assessment?: boolean;
    area?: boolean;
    status?: boolean;
    sessionHealth?: boolean;
  } = {}
) {
  const results: any = {};

  const promises: Promise<any>[] = [];

  if (filters.student || Object.keys(filters).length === 0) {
    promises.push(
      prisma.student
        .findMany({
          select: {
            id: true,
            translations: {
              where: { lang },
              select: { fullName: true },
            },
            fullName: true,
          },
        })
        .then((students: any) => {
          const formatName = (item: any) =>
            item.translations && item.translations[0]?.fullName
              ? item.translations[0].fullName
              : item.fullName;
          results.students = students.map((s: any) => ({
            id: s.id,
            fullName: formatName(s),
          }));
        })
    );
  }

  if (filters.assessment || Object.keys(filters).length === 0) {
    promises.push(
      prisma.assessment
        .findMany({
          select: {
            id: true,
            translations: {
              where: { lang },
              select: { name: true },
            },
            name: true,
          },
        })
        .then((assessments: any) => {
          const formatName = (item: any) =>
            item.translations && item.translations[0]?.name
              ? item.translations[0].name
              : item.name;
          results.assessments = assessments.map((a: any) => ({
            id: a.id,
            name: formatName(a),
          }));
        })
    );
  }

  if (filters.area || Object.keys(filters).length === 0) {
    promises.push(
      prisma.area
        .findMany({
          select: {
            id: true,
            translations: {
              where: { lang },
              select: { name: true },
            },
            name: true,
          },
        })
        .then((areas: any) => {
          const formatName = (item: any) =>
            item.translations && item.translations[0]?.name
              ? item.translations[0].name
              : item.name;
          results.areas = areas.map((a: any) => ({
            id: a.id,
            name: formatName(a),
          }));
        })
    );
  }

  if (filters.status || Object.keys(filters).length === 0) {
    results.statuses = [
      "ABSENT",
      "PENDING",
      "MOVED_TO_PAPER",
      "IN_PROGRESS",
      "BLOCKED",
      "DENIED",
      "STUDENT_SUBMISSION",
      "TIMER_SUBMISSION",
    ];
  }

  if (filters.sessionHealth || Object.keys(filters).length === 0) {
    results.sessionHealths = ["GOOD", "POOR", "DISCONNECTED"];
  }

  await Promise.all(promises);
  return results;
}
