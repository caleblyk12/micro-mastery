
interface SkillCardProps {
  title: string;
  category: string;
  date: string;
}

function SkillCard({ title, category, date }: SkillCardProps) {
  return (
    <div className="bg-white shadow-md rounded-xl p-4 w-full sm:w-[250px]">
      <p className="text-sm text-gray-500">Category: {category}</p>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-gray-400">Learned on: {date}</p>
    </div>
  );
}

export default SkillCard;