import { Course } from '../types';

export const DEFAULT_COURSE_START_DATE = '2026-07-13';

export const INITIAL_COURSES: Course[] = [
  {
    id: "course-econ-101",
    code: "ECON 101",
    title: "Microeconomics & Market Analysis",
    instructor: "Prof. Sarah Jenkins",
    startDate: "2026-07-13",
    category: "Business & Economics",
    description: "Supply and demand, market equilibrium, cost structures, consumer theory, and opportunity cost.",
    createdDate: "2026-07-27",
    isCustom: false
  },
  {
    id: "course-biol-105",
    code: "BIOL 105",
    title: "General Biology & Molecular Genetics",
    instructor: "Prof. Robert Vance",
    startDate: "2026-07-13",
    category: "Medicine & Life Sciences",
    description: "Cellular structures, DNA replication, gene expression, metabolism, and enzyme kinetics.",
    createdDate: "2026-07-27",
    isCustom: false
  },
  {
    id: "course-math-201",
    code: "MATH 201",
    title: "Linear Algebra & Matrix Methods",
    instructor: "Prof. Elena Rostova",
    startDate: "2026-07-13",
    category: "Science & Mathematics",
    description: "Vector spaces, matrix factorizations, eigenvalues, eigenvectors, and linear transformations.",
    createdDate: "2026-07-27",
    isCustom: false
  },
  {
    id: "course-cs-101",
    code: "CS 101",
    title: "Intro to Computer Science & Algorithms",
    instructor: "Prof. Alan Turing",
    startDate: "2026-07-13",
    category: "Computer Science & AI",
    description: "Algorithm design, data structures, recursion, complexity analysis, and problem solving.",
    createdDate: "2026-07-27",
    isCustom: false
  }
];
