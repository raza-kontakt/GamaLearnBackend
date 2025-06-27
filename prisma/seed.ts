import {
  PrismaClient,
  AssessmentStatus,
  ExamSubmissionStatus,
  SessionHealth,
  ActivityType,
  Area,
  Program,
  Course,
  Group,
  Student,
  Assessment,
  Prisma,
} from "@prisma/client";
import { faker as fakerEn } from "@faker-js/faker";
import { Faker, ar } from "@faker-js/faker";

const fakerAr = new Faker({ locale: [ar] });
const prisma = new PrismaClient();

const BATCH_SIZE = 100;
const AREAS_COUNT = 5;
const PROGRAMS_COUNT = 10;
const COURSES_COUNT = 20;
const GROUPS_COUNT = 10;
const STUDENTS_COUNT = 500;
const ASSESSMENTS_COUNT = 15;

export const getRandomNumber = <T extends number>(max: T): number => {
  return Math.random() * max;
};

async function batchCreateMany<T>(
  items: T[],
  createFn: (batch: T[]) => Promise<any>,
  batchSize: number = BATCH_SIZE
) {
  const results: any[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const result = await createFn(batch);
    if (Array.isArray(result)) {
      results.push(...result);
    } else {
      results.push(result);
    }
  }
  return results;
}

async function main() {
  console.log("Seeding started...");

  // 1. Clean up existing data
  console.log("Cleaning database...");
  await prisma.$transaction([
    prisma.studentActivity.deleteMany(),
    prisma.examSubmission.deleteMany(),
    prisma.assessmentTranslation.deleteMany(),
    prisma.assessment.deleteMany(),
    prisma.studentTranslation.deleteMany(),
    prisma.student.deleteMany(),
    prisma.groupTranslation.deleteMany(),
    prisma.group.deleteMany(),
    prisma.courseTranslation.deleteMany(),
    prisma.course.deleteMany(),
    prisma.programTranslation.deleteMany(),
    prisma.program.deleteMany(),
    prisma.areaTranslation.deleteMany(),
    prisma.area.deleteMany(),
    prisma.examiner.deleteMany(),
  ]);

  // 1.1 Create Test examiner
  console.log("Seeding Admin User...");
  await prisma.examiner.create({
    data: {
      name: "Admin Ali",
      userName: "admin",
      password: "$2a$12$eOAVvWxl.id1JTt2UxWsa.Gd9MZt0ghcrkJ0uMKtItM4sn7MG4DKe",
    },
  });

  // 2. Seed Areas with batch operations
  console.log("Seeding Areas...");
  const areaData = Array.from({ length: AREAS_COUNT }, (_, i) => ({
    name: `كلية رقم ${i + 1}`,
    createdAt: new Date(),
  }));

  const areas = await prisma.$transaction(
    areaData.map((data) =>
      prisma.area.create({
        data,
      })
    )
  );

  const areaTranslations = areas.flatMap((area) => [
    { areaId: area.id, lang: "en", name: `${fakerEn.company.name()} Faculty` },
    { areaId: area.id, lang: "ar", name: area.name },
  ]);

  await prisma.areaTranslation.createMany({ data: areaTranslations });

  // 3. Seed Programs with batch operations
  console.log("Seeding Programs...");
  const programData = Array.from({ length: PROGRAMS_COUNT }, (_, i) => ({
    name: `برنامج رقم ${i + 1}`,
    createdAt: new Date(),
  }));

  const programs = await prisma.$transaction(
    programData.map((data) =>
      prisma.program.create({
        data,
      })
    )
  );

  const programTranslations = programs.flatMap((program) => [
    {
      programId: program.id,
      lang: "en",
      name: `${fakerEn.commerce.department()} Program`,
    },
    { programId: program.id, lang: "ar", name: program.name },
  ]);

  await prisma.programTranslation.createMany({ data: programTranslations });

  // 4. Seed Courses with batch operations
  console.log("Seeding Courses...");
  const courseData = Array.from({ length: COURSES_COUNT }, (_, i) => ({
    name: `مقرر رقم ${i + 1}`,
    programId: programs[i % programs.length].id,
    createdAt: new Date(),
  }));

  const courses = await prisma.$transaction(
    courseData.map((data) =>
      prisma.course.create({
        data,
      })
    )
  );

  const courseTranslations = courses.flatMap((course) => [
    {
      courseId: course.id,
      lang: "en",
      name: `${fakerEn.commerce.productName()} Course`,
    },
    { courseId: course.id, lang: "ar", name: course.name },
  ]);

  await prisma.courseTranslation.createMany({ data: courseTranslations });

  // 5. Seed Groups with batch operations
  console.log("Seeding Groups...");
  const groups: Group[] = [];
  const groupTranslations: Prisma.GroupTranslationCreateManyInput[] = [];

  for (let i = 0; i < GROUPS_COUNT; i++) {
    const area = areas[i % areas.length];
    const arName = `السنة ${i + 1}`;
    const enName = `Year ${i + 1}`;

    const group = await prisma.group.create({
      data: {
        name: arName,
        areaId: area.id,
      },
    });

    groups.push(group);
    groupTranslations.push(
      { groupId: group.id, lang: "en", name: enName },
      { groupId: group.id, lang: "ar", name: arName }
    );

    // Add 1 child group
    const arChildName = `القسم ${String.fromCharCode(65 + i)}`;
    const enChildName = `Section ${String.fromCharCode(65 + i)}`;

    const child = await prisma.group.create({
      data: {
        name: arChildName,
        areaId: area.id,
        parentId: group.id,
      },
    });

    groups.push(child);
    groupTranslations.push(
      { groupId: child.id, lang: "en", name: enChildName },
      { groupId: child.id, lang: "ar", name: arChildName }
    );
  }

  await prisma.groupTranslation.createMany({ data: groupTranslations });

  // 6. Seed Students with batch operations
  console.log("Seeding Students...");
  const studentData = Array.from({ length: STUDENTS_COUNT }, (_, i) => {
    const arFullName = fakerAr.person.fullName();
    return {
      username: fakerEn.internet.userName().toLowerCase() + i,
      fullName: arFullName,
      email: fakerEn.internet.email(),
      groupId: groups[i % groups.length].id,
      createdAt: new Date(),
    };
  });

  const students = await prisma.$transaction(
    studentData.map((data) => prisma.student.create({ data }))
  );

  const studentTranslations = students.flatMap((student) => [
    {
      studentId: student.id,
      lang: "en",
      fullName: fakerEn.person.fullName(),
    },
    { studentId: student.id, lang: "ar", fullName: student.fullName },
  ]);

  await prisma.studentTranslation.createMany({ data: studentTranslations });

  // 7. Seed Assessments with batch operations
  console.log("Seeding Assessments...");
  const assessmentData = Array.from({ length: ASSESSMENTS_COUNT }, (_, i) => {
    const arWords = `اختبار رقم ${i + 1}`;
    return {
      name: arWords,
      startDate: fakerEn.date.past(),
      endDate: fakerEn.date.future(),
      status: [
        AssessmentStatus.CLOSED,
        AssessmentStatus.FINISHED,
        AssessmentStatus.NOT_STARTED,
      ][i % 3],
      areaId: areas[i % areas.length].id,
      courseId: courses[i % courses.length].id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  const assessments = await prisma.$transaction(
    assessmentData.map((data) => prisma.assessment.create({ data }))
  );

  const assessmentTranslations = assessments.flatMap((assessment) => [
    {
      assessmentId: assessment.id,
      lang: "en",
      name: `${fakerEn.word.words(2)} Assessment`,
    },
    { assessmentId: assessment.id, lang: "ar", name: assessment.name },
  ]);

  await prisma.assessmentTranslation.createMany({ data: assessmentTranslations });

  // 8. Seed Exam Submissions & Activities with optimized batching
  console.log("Seeding Exam Submissions and Activities...");
  
  const submissionData: Prisma.ExamSubmissionCreateManyInput[] = [];
  const activityData: Prisma.StudentActivityCreateManyInput[] = [];

  for (const assessment of assessments) {
    const areaStudents = students.filter((student) => {
      const group = groups.find((g) => g.id === student.groupId);
      return group && group.areaId === assessment.areaId;
    });

    for (const student of areaStudents) {
      // Weighted selection to ensure more ABSENT entries for testing
      const submissionStatus = fakerEn.helpers.weightedArrayElement([
        { weight: 3, value: ExamSubmissionStatus.STUDENT_SUBMISSION },
        { weight: 4, value: ExamSubmissionStatus.ABSENT }, // Higher weight for more absent entries
        { weight: 2, value: ExamSubmissionStatus.IN_PROGRESS },
        { weight: 1, value: ExamSubmissionStatus.PENDING },
      ]);

      if (submissionStatus === ExamSubmissionStatus.ABSENT) {
        submissionData.push({
          studentId: student.id,
          assessmentId: assessment.id,
          status: ExamSubmissionStatus.ABSENT,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        continue;
      }

      if (submissionStatus === ExamSubmissionStatus.PENDING) {
        submissionData.push({
          studentId: student.id,
          assessmentId: assessment.id,
          status: ExamSubmissionStatus.PENDING,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        continue;
      }

      const submission = await prisma.examSubmission.create({
        data: {
          studentId: student.id,
          assessmentId: assessment.id,
          status: submissionStatus,
          sessionHealth: fakerEn.helpers.arrayElement([
            SessionHealth.GOOD,
            SessionHealth.POOR,
            SessionHealth.DISCONNECTED,
          ]),
          loginTime: fakerEn.date.past(),
          startTime: fakerEn.date.past(),
          timeElapsed:
            submissionStatus === ExamSubmissionStatus.STUDENT_SUBMISSION
              ? 3600
              : 1800,
          questionsSync:
            submissionStatus === ExamSubmissionStatus.STUDENT_SUBMISSION
              ? getRandomNumber(50)
              : getRandomNumber(10),
        },
      });

      activityData.push({
        submissionId: submission.id,
        activityType: ActivityType.LOGIN,
        timestamp: new Date(),
      });

      if (submission.questionsSync > 15) {
        activityData.push({
          submissionId: submission.id,
          activityType: ActivityType.QUESTION_ANSWERED,
          details: "Answered question 15",
          timestamp: new Date(),
        });
      }

      if (submissionStatus === ExamSubmissionStatus.STUDENT_SUBMISSION) {
        activityData.push({
          submissionId: submission.id,
          activityType: ActivityType.LOGOUT,
          details: "Finished exam.",
          timestamp: new Date(),
        });
      }
    }
  }

  // Create batch submissions for ABSENT and PENDING statuses
  if (submissionData.length > 0) {
    await prisma.examSubmission.createMany({ data: submissionData });
  }

  await prisma.studentActivity.createMany({ data: activityData });

  console.log("Seeding finished.");
  console.log(`Created ${submissionData.length} ABSENT/PENDING submissions for testing`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
