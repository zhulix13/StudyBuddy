import { Card } from "@/components/ui/card"

interface Props {
  group: {
    id: string
    name: string
    description: string
  }
  isActive: boolean
  onClick: () => void
}

export const GroupCard = ({ group, isActive, onClick }: Props) => {
  return (
    <Card
      onClick={onClick}
      className={`p-4 mb-2 cursor-pointer border mx-1 ${
        isActive ? "bg-primary/10 border-primary" : "hover:bg-muted"
      }`}
    >
      <h3 className="font-semibold text-sm">{group.name}</h3>
      <p className="text-xs text-muted-foreground truncate">
        {group.description}
      </p>
    </Card>
  )
}
