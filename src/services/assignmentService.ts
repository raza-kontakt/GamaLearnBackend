import prisma from '../libs/prisma';

export async function getAssignmentsService({
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

  const [assignments, totalCount, responseFilters] = await Promise.all([
    prisma.assessment.findMany({
      where: filter,
      skip,
      take: limit,
      include: {
        area: {
          include: {
            translations: {
              where: { lang },
              select: { name: true },
            },
          },
        },
        course: {
          select: {
            name: true,
            translations: {
              where: { lang },
              select: { name: true },
            },
            program: {
              select: {
                name: true,
                translations: {
                  where: { lang },
                  select: { name: true },
                },
              },
            },
          },
        },
        translations: {
          where: { lang },
          select: { name: true },
        },
        _count: {
          select: {
            submissions: true,
          },
        },
      },
    }),
    prisma.assessment.count({ where: filter }),
    getAssignmentFiltersService(lang, filter),
  ]);

  const result = assignments.map((a: any) => {
    const assignment = {
      ...a,
      name:
        Array.isArray(a.translations) && a.translations[0]?.name
          ? a.translations[0].name
          : a.name,
      area: a.area
        ? {
            ...a.area,
            name:
              Array.isArray(a.area.translations) && a.area.translations[0]?.name
                ? a.area.translations[0].name
                : a.area.name,
          }
        : undefined,
      course: a.course
        ? {
            ...a.course,
            name:
              Array.isArray(a.course.translations) &&
              a.course.translations[0]?.name
                ? a.course.translations[0].name
                : a.course.name,
            program: a.course.program
              ? {
                  ...a.course.program,
                  name:
                    Array.isArray(a.course.program.translations) &&
                    a.course.program.translations[0]?.name
                      ? a.course.program.translations[0].name
                      : a.course.program.name,
                }
              : undefined,
          }
        : undefined,
      studentCount: a._count.submissions,
    };
    delete assignment.translations;
    delete assignment._count;
    if (assignment.area) delete assignment.area.translations;
    if (assignment.course) {
      delete assignment.course.translations;
      if (assignment.course.program)
        delete assignment.course.program.translations;
    }
    return assignment;
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

export async function getAssignmentFiltersService(
  lang: string,
  filters: {
    area?: boolean;
    program?: boolean;
    course?: boolean;
    status?: boolean;
  } = {}
) {
  const results: any = {};

  const promises: Promise<any>[] = [];

  const anyFilterSet = Object.values(filters).some(Boolean);

  if (anyFilterSet || Object.keys(filters).length === 0) {
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
          results.areas = areas.map((a: any) => ({ id: a.id, name: formatName(a) }));
        })
    );
  }

  if (anyFilterSet || Object.keys(filters).length === 0) {
    promises.push(
      prisma.program
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
        .then((programs: any) => {
          const formatName = (item: any) =>
            item.translations && item.translations[0]?.name
              ? item.translations[0].name
              : item.name;
          results.programs = programs.map((p: any) => ({
            id: p.id,
            name: formatName(p),
          }));
        })
    );
  }

  if (anyFilterSet || Object.keys(filters).length === 0) {
    promises.push(
      prisma.course
        .findMany({
          select: {
            id: true,
            programId: true,
            translations: {
              where: { lang },
              select: { name: true },
            },
            name: true,
          },
        })
        .then((courses: any) => {
          const formatName = (item: any) =>
            item.translations && item.translations[0]?.name
              ? item.translations[0].name
              : item.name;
          results.courses = courses.map((c: any) => ({
            id: c.id,
            programId: c.programId,
            name: formatName(c),
          }));
        })
    );
  }

  if (anyFilterSet || Object.keys(filters).length === 0) {
    results.statuses = ['NOT_STARTED', 'ON_GOING', 'FINISHED', 'CLOSED'];
  }

  await Promise.all(promises);
  return results;
}
