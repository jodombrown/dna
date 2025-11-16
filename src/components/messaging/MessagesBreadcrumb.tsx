import React from 'react';
import { Link } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { ConversationListItem } from '@/types/messaging';

interface MessagesBreadcrumbProps {
  selectedConversation?: ConversationListItem | null;
  onClearSelection?: () => void;
}

/**
 * MessagesBreadcrumb - Contextual breadcrumb navigation for MESSAGES_MODE
 * 
 * States:
 * - Dashboard > Messages (when browsing conversations)
 * - Dashboard > Messages > [User Name] (when viewing specific conversation)
 */
const MessagesBreadcrumb: React.FC<MessagesBreadcrumbProps> = ({ 
  selectedConversation,
  onClearSelection 
}) => {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {/* Dashboard */}
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/dna/feed">Home</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        
        <BreadcrumbSeparator />
        
        {/* Messages */}
        {selectedConversation ? (
          <BreadcrumbItem>
            <BreadcrumbLink 
              asChild
              className="cursor-pointer"
            >
              <span onClick={onClearSelection}>Messages</span>
            </BreadcrumbLink>
          </BreadcrumbItem>
        ) : (
          <BreadcrumbItem>
            <BreadcrumbPage>Messages</BreadcrumbPage>
          </BreadcrumbItem>
        )}
        
        {/* Selected Conversation Name */}
        {selectedConversation && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="line-clamp-1 max-w-[200px]">
                {selectedConversation.other_user_full_name || 'Conversation'}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default MessagesBreadcrumb;
