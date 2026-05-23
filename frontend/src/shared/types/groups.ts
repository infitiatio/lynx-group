export interface GroupDto {
  id: string
  ownerUserId: string
  title: string
  description: string
  isPublished: boolean
  shareToken: string | null
  createdAt: string
  updatedAt: string
  isOwner: boolean
}

export interface GroupFormValues {
  title: string
  description: string
}