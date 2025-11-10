import ProjectContainer from "../ProjectContainer/ProjectContainer";

export default function SkillSection({ data }) {
  const skillMap = data.list.reduce((acc, project) => {
    const skills = project.nc_3zu8___nc_m2m_nc_3zu8__Projec_Skills || [];
    skills.forEach((s) => {
      const skillName = s.Skills?.Skill || "Unbekannt";
      if (!acc[skillName]) acc[skillName] = [];
      acc[skillName].push(project);
    });
    return acc;
  }, {});

  const entries = Object.entries(skillMap);

  return (
    <>
      {entries.map(([skill, projects], index) => (
        <ProjectContainer
          key={skill}
          skill={skill}
          projects={projects}
          isLast={index === entries.length - 1}
        />
      ))}
    </>
  );
}
