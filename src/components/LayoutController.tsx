import React from 'react';
import { useViewState } from '@/contexts/ViewStateContext';
import ThreeColumnLayout from '@/layouts/ThreeColumnLayout';
import TwoColumnLayout from '@/layouts/TwoColumnLayout';
import FullCanvasLayout from '@/layouts/FullCanvasLayout';

interface LayoutControllerProps {
  // Column content for ThreeColumnLayout
  leftColumn?: React.ReactNode;
  centerColumn?: React.ReactNode;
  rightColumn?: React.ReactNode;
  
  // Column content for TwoColumnLayout
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  
  // Full canvas content
  canvasContent?: React.ReactNode;
  canvasSidebar?: React.ReactNode;
  
  // Fallback for simple cases
  children?: React.ReactNode;
}

/**
 * LayoutController - The intelligent layout selector
 * 
 * This component automatically selects and renders the appropriate layout
 * based on the current view state (determined by the route).
 * 
 * View State Mappings:
 * - DASHBOARD_HOME → ThreeColumnLayout (15%-70%-15%)
 * - CONNECT_MODE → ThreeColumnLayout (15%-70%-15%)
 * - CONVENE_MODE → TwoColumnLayout (60%-40%)
 * - MESSAGES_MODE → TwoColumnLayout (35%-65%)
 * - COLLABORATE_MODE → FullCanvasLayout (20%-80%)
 * - CONTRIBUTE_MODE → TwoColumnLayout (55%-45%)
 * - CONVEY_MODE → ThreeColumnLayout (15%-70%-15%)
 * - FOCUS_DETAIL_MODE → Modal overlay (handled separately)
 * 
 * Usage Example:
 * ```tsx
 * <LayoutController
 *   leftColumn={<DashboardNav />}
 *   centerColumn={<Feed />}
 *   rightColumn={<Widgets />}
 * />
 * ```
 */
const LayoutController: React.FC<LayoutControllerProps> = ({
  leftColumn,
  centerColumn,
  rightColumn,
  leftContent,
  rightContent,
  canvasContent,
  canvasSidebar,
  children,
}) => {
  const { viewState, layoutConfig } = useViewState();

  // Render appropriate layout based on view state
  switch (viewState) {
    case 'DASHBOARD_HOME':
      return (
        <ThreeColumnLayout
          leftWidth={layoutConfig.leftWidth}
          centerWidth={layoutConfig.centerWidth}
          rightWidth={layoutConfig.rightWidth}
          left={leftColumn}
          center={centerColumn || children}
          right={rightColumn}
        />
      );

    case 'CONNECT_MODE':
      return (
        <ThreeColumnLayout
          leftWidth={layoutConfig.leftWidth}
          centerWidth={layoutConfig.centerWidth}
          rightWidth={layoutConfig.rightWidth}
          left={leftColumn}
          center={centerColumn || children}
          right={rightColumn} // Adapted with network stats
        />
      );

    case 'CONVENE_MODE':
      return (
        <TwoColumnLayout
          leftWidth={layoutConfig.leftWidth}
          rightWidth={layoutConfig.rightWidth}
          left={leftContent || centerColumn || children}
          right={rightContent || rightColumn}
        />
      );

    case 'MESSAGES_MODE':
      return (
        <TwoColumnLayout
          leftWidth={layoutConfig.leftWidth}
          rightWidth={layoutConfig.rightWidth}
          left={leftContent || leftColumn}
          right={rightContent || rightColumn || children}
        />
      );

    case 'COLLABORATE_MODE':
      return (
        <FullCanvasLayout
          sidebar={canvasSidebar || leftColumn}
          sidebarWidth={layoutConfig.leftWidth}
          content={canvasContent || centerColumn || children}
          collapsible={true}
        />
      );

    case 'CONTRIBUTE_MODE':
      return (
        <TwoColumnLayout
          leftWidth={layoutConfig.leftWidth}
          rightWidth={layoutConfig.rightWidth}
          left={leftContent || centerColumn || children}
          right={rightContent || rightColumn}
        />
      );

    case 'CONVEY_MODE':
      return (
        <ThreeColumnLayout
          leftWidth={layoutConfig.leftWidth}
          centerWidth={layoutConfig.centerWidth}
          rightWidth={layoutConfig.rightWidth}
          left={leftColumn}
          center={centerColumn || children}
          right={rightColumn}
        />
      );

    case 'FOCUS_DETAIL_MODE':
      // For focus/detail mode, we might want modal overlay
      // For now, render with minimal layout
      return (
        <div className="w-full h-full p-4 transition-all duration-300 ease-in-out">
          {children || centerColumn}
        </div>
      );

    default:
      // Fallback to three-column layout
      return (
        <ThreeColumnLayout
          left={leftColumn}
          center={centerColumn || children}
          right={rightColumn}
        />
      );
  }
};

export default LayoutController;
