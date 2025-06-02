export const ALL_ACHIEVEMENTS = [
  { id: 1, title: "Initiate", desc: "Learn your very first skill", condition: (skills: any[], _: number) => skills.length >= 1 },
  { id: 3, title: "Skilled learner", desc: "Learn 5 skills in total", condition: (skills: any[], _: number) => skills.length >= 5 },
  { id: 6, title: "MicroMaster", desc: "Learn 10 skills total", condition: (skills: any[], _: number) => skills.length >= 10},
  { id: 2, title: "3 Day Streak", desc: "Maintain a 3 day streak", condition: (_: any[], streak: number) => streak >= 3 },
  { id: 4, title: "5 Day Streak", desc:"Maintain a 5 day streak", condition: (_: any[], streak: number) => streak >= 5},
  { id: 5, title: "10 Day Streak", desc:"Maintain a 10 day streak", condition: (_: any[], streak: number) => streak >= 10}
];