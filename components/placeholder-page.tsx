import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface PlaceholderPageProps {
  title: string
  description: string
  cardTitle: string
  cardDescription: string
  comingSoonText?: string
}

export function PlaceholderPage({
  title,
  description,
  cardTitle,
  cardDescription,
  comingSoonText = 'Coming soon'
}: PlaceholderPageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{cardTitle}</CardTitle>
          <CardDescription>{cardDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{comingSoonText}</p>
        </CardContent>
      </Card>
    </div>
  )
}
