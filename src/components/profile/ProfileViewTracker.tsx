import { useEffect } from 'react'
import { useProfileViews } from '@/hooks/useProfileViews'
import { useAuth } from '@/contexts/AuthContext'

interface ProfileViewTrackerProps {
  profileId: string
}

export const ProfileViewTracker: React.FC<ProfileViewTrackerProps> = ({ profileId }) => {
  const { trackProfileView } = useProfileViews()
  const { user } = useAuth()

  useEffect(() => {
    // Don't track views of your own profile
    if (user?.id === profileId) return

    // Track the profile view
    trackProfileView(profileId, user?.id)
  }, [profileId, user?.id, trackProfileView])

  return null // This component doesn't render anything
}

export default ProfileViewTracker