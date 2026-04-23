export const TAXONOMY = {
  rw: {
    label: "Reading & Writing",
    subtypes: {
      "Information and Ideas": ["Central Ideas and Details", "Inferences", "Command of Evidence"],
      "Craft and Structure": ["Words in Context", "Text Structure and Purpose", "Cross-Text Connections"],
      "Expression of Ideas": ["Rhetorical Synthesis", "Transitions"],
      "Standard English Conventions": ["Boundaries", "Form, Structure, and Sense"],
    },
  },
  math: {
    label: "Math",
    subtypes: {
      Algebra: ["Linear equations in one variable", "Linear functions", "Linear equations in two variables", "Systems of two linear equations in two variables", "Linear inequalities in one or two variables"],
      "Advanced Math": ["Nonlinear functions", "Nonlinear equations in one variable and systems of equations in two variables", "Equivalent expressions"],
      "Problem-Solving and Data Analysis": ["Ratios, rates, proportional relationships, and units", "Percentages", "One-variable data: Distributions and measures of center and spread", "Two-variable data: Models and scatterplots", "Probability and conditional probability", "Inference from sample statistics and margin of error", "Evaluating statistical claims: Observational studies and experiments"],
      "Geometry and Trigonometry": ["Area and volume", "Lines, angles, and triangles", "Right triangles and trigonometry", "Circles"],
    },
  },
};

export const allSkills = (sec) => Object.values(TAXONOMY[sec].subtypes).flat();
export const RW_SKILLS = allSkills("rw");
export const MATH_SKILLS = allSkills("math");
export const isRWSkill = (s) => RW_SKILLS.includes(s);
