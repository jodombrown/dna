
import React, { useState } from 'react';
import { Professional, Community, Event } from '@/hooks/useSearch';
import ConnectDialogs from '@/components/connect/ConnectDialogs';
import SearchResultsLoading from '@/components/search/results/SearchResultsLoading';
import SearchResultsEmpty from '@/components/search/results/SearchResultsEmpty';
import SearchResultsHeader from '@/components/search/results/SearchResultsHeader';
import ProfessionalsResults from '@/components/search/results/ProfessionalsResults';
import CommunitiesResults from '@/components/search/results/CommunitiesResults';
import EventsResults from '@/components/search/results/EventsResults';

interface SearchResultsProps {
  results: {
    professionals: Professional[];
    communities: Community[];
    events: Event[];
  };
  loading: boolean;
  onConnect: (userId: string) => void;
  onMessage: (userId: string, userName: string) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  loading,
  onConnect,
  onMessage
}) => {
  const [isConnectDialogOpen, setIsConnectDialogOpen] = useState(false);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [isJoinCommunityDialogOpen, setIsJoinCommunityDialogOpen] = useState(false);
  const [isRegisterEventDialogOpen, setIsRegisterEventDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedUserName, setSelectedUserName] = useState<string>('');

  const handleConnectClick = (userId: string, isLoggedIn: boolean) => {
    if (isLoggedIn) {
      onConnect(userId);
    } else {
      setSelectedUserId(userId);
      setIsConnectDialogOpen(true);
    }
  };

  const handleMessageClick = (userId: string, userName: string, isLoggedIn: boolean) => {
    if (isLoggedIn) {
      onMessage(userId, userName);
    } else {
      setSelectedUserId(userId);
      setSelectedUserName(userName);
      setIsMessageDialogOpen(true);
    }
  };

  if (loading) {
    return <SearchResultsLoading />;
  }

  const totalResults = results.professionals.length + results.communities.length + results.events.length;

  if (totalResults === 0) {
    return <SearchResultsEmpty />;
  }

  return (
    <>
      <div className="space-y-4">
        <SearchResultsHeader
          professionalsCount={results.professionals.length}
          communitiesCount={results.communities.length}
          eventsCount={results.events.length}
        />
        
        <ProfessionalsResults
          professionals={results.professionals}
          onConnect={(userId) => handleConnectClick(userId, false)}
          onMessage={(userId, userName) => handleMessageClick(userId, userName, false)}
        />

        <CommunitiesResults communities={results.communities} />

        <EventsResults events={results.events} />
      </div>

      <ConnectDialogs
        isConnectDialogOpen={isConnectDialogOpen}
        setIsConnectDialogOpen={setIsConnectDialogOpen}
        isMessageDialogOpen={isMessageDialogOpen}
        setIsMessageDialogOpen={setIsMessageDialogOpen}
        isJoinCommunityDialogOpen={isJoinCommunityDialogOpen}
        setIsJoinCommunityDialogOpen={setIsJoinCommunityDialogOpen}
        isRegisterEventDialogOpen={isRegisterEventDialogOpen}
        setIsRegisterEventDialogOpen={setIsRegisterEventDialogOpen}
      />
    </>
  );
};

export default SearchResults;
