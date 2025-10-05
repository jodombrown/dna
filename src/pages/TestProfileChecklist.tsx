import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

const TestProfileChecklist = () => {
  const [checklist, setChecklist] = useState({
    // Test all routes work
    profileLoads: false,
    fakeUsernameShows404: false,
    editRequiresAuth: false,
    
    // Verify data display
    skillsShowNames: false,
    causesShowIcons: false,
    socialLinksClickable: false,
    contributionHistoryRenders: false,
    
    // Test edit flow
    formPrePopulates: false,
    saveUpdatesDatabase: false,
    redirectsAfterSave: false,
    changesReflectImmediately: false,
    
    // Check authorization
    cantEditOthersProfiles: false,
    onboardingGuardWorks: false,
    unauthenticatedCanView: false,
    
    // Mobile testing
    profileResponsive: false,
    editFormUsableMobile: false,
    noHorizontalScroll: false,
    
    // Integration points
    applicantProfileClickable: false,
    navLinksToProfile: false,
    usernameAppearsCorrectly: false,
  });

  const toggleCheck = (key: keyof typeof checklist) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const categories = [
    {
      title: '1. Test All Routes Work',
      items: [
        { key: 'profileLoads', label: '/profile/existing-username loads' },
        { key: 'fakeUsernameShows404', label: '/profile/fake-username shows 404' },
        { key: 'editRequiresAuth', label: '/profile/username/edit requires auth + ownership' },
      ]
    },
    {
      title: '2. Verify Data Display',
      items: [
        { key: 'skillsShowNames', label: 'Skills show names (not IDs)' },
        { key: 'causesShowIcons', label: 'Causes show names + icons' },
        { key: 'socialLinksClickable', label: 'Social links are clickable' },
        { key: 'contributionHistoryRenders', label: 'Contribution history renders' },
      ]
    },
    {
      title: '3. Test Edit Flow',
      items: [
        { key: 'formPrePopulates', label: 'Form pre-populates' },
        { key: 'saveUpdatesDatabase', label: 'Save updates database' },
        { key: 'redirectsAfterSave', label: 'Redirects back to profile' },
        { key: 'changesReflectImmediately', label: 'Changes reflect immediately' },
      ]
    },
    {
      title: '4. Check Authorization',
      items: [
        { key: 'cantEditOthersProfiles', label: "Can't edit other users' profiles" },
        { key: 'onboardingGuardWorks', label: 'OnboardingGuard blocks incomplete users' },
        { key: 'unauthenticatedCanView', label: 'Unauthenticated users can view public profiles' },
      ]
    },
    {
      title: '5. Mobile Testing',
      items: [
        { key: 'profileResponsive', label: 'Profile layout responsive' },
        { key: 'editFormUsableMobile', label: 'Edit form usable on mobile' },
        { key: 'noHorizontalScroll', label: 'No horizontal scroll' },
      ]
    },
    {
      title: '6. Integration Points',
      items: [
        { key: 'applicantProfileClickable', label: 'Application review can click to view applicant profile' },
        { key: 'navLinksToProfile', label: 'Nav bar links to own profile (if applicable)' },
        { key: 'usernameAppearsCorrectly', label: 'Username appears correctly throughout app' },
      ]
    },
  ];

  const totalItems = Object.keys(checklist).length;
  const completedItems = Object.values(checklist).filter(Boolean).length;
  const percentComplete = Math.round((completedItems / totalItems) * 100);

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">PRD #3: Profile System Testing</h1>
        <div className="flex items-center gap-4">
          <Badge variant={percentComplete === 100 ? 'default' : 'secondary'}>
            {completedItems} / {totalItems} Complete
          </Badge>
          <div className="flex-1 bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${percentComplete}%` }}
            />
          </div>
          <span className="text-sm text-muted-foreground">{percentComplete}%</span>
        </div>
      </div>

      <div className="space-y-6">
        {categories.map((category) => (
          <Card key={category.title}>
            <CardHeader>
              <CardTitle className="text-lg">{category.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {category.items.map((item) => (
                <div key={item.key} className="flex items-center gap-3">
                  <Checkbox
                    id={item.key}
                    checked={checklist[item.key as keyof typeof checklist]}
                    onCheckedChange={() => toggleCheck(item.key as keyof typeof checklist)}
                  />
                  <label
                    htmlFor={item.key}
                    className="text-sm cursor-pointer flex-1"
                  >
                    {item.label}
                  </label>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}

        {percentComplete === 100 && (
          <Card className="border-green-500 bg-green-50 dark:bg-green-950">
            <CardContent className="pt-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-green-700 dark:text-green-300 mb-2">
                  🎉 PRD #3 Complete!
                </h2>
                <p className="text-green-600 dark:text-green-400">
                  All profile system tests have passed. Ready to move to PRD #4!
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TestProfileChecklist;
