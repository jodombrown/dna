import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';

interface Question {
  id: string;
  event_id: string;
  label: string;
  type: string;
  required: boolean;
  position: number;
  options: any;
}

interface Props { eventId: string }

const RegistrationQuestionsTab: React.FC<Props> = ({ eventId }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  // New question form state
  const [label, setLabel] = useState('');
  const [type, setType] = useState('text');
  const [required, setRequired] = useState(false);
  const [optionsStr, setOptionsStr] = useState('');

  const load = async () => {
    try {
      const { data, error } = await supabase
        .from('event_registration_questions')
        .select('*')
        .eq('event_id', eventId)
        .order('position', { ascending: true });
      if (error) throw error;
      setQuestions(data || []);
    } catch (e) {
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [eventId]);

  const addQuestion = async () => {
    try {
      if (!label.trim()) {
        toast.error('Label is required');
        return;
      }
      const opts = optionsStr.trim() ? optionsStr.split(',').map(s => s.trim()).filter(Boolean) : null;
      const { error } = await supabase
        .from('event_registration_questions')
        .insert({
          event_id: eventId,
          label: label.trim(),
          type,
          required,
          position: (questions[questions.length - 1]?.position || 0) + 1,
          options: opts ? { options: opts } : null,
        });
      if (error) throw error;
      setLabel(''); setType('text'); setRequired(false); setOptionsStr('');
      toast.success('Question added');
      await load();
    } catch (e) {
      toast.error('Failed to add question');
    }
  };

  const remove = async (id: string) => {
    try {
      const { error } = await supabase
        .from('event_registration_questions')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast.success('Question removed');
      await load();
    } catch (e) {
      toast.error('Failed to remove question');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Registration Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* New Question */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
            <div className="md:col-span-2">
              <label className="text-sm">Label</label>
              <Input value={label} onChange={e => setLabel(e.target.value)} placeholder="e.g. What brings you to this event?" />
            </div>
            <div>
              <label className="text-sm">Type</label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Short Text</SelectItem>
                  <SelectItem value="textarea">Long Text</SelectItem>
                  <SelectItem value="select">Dropdown</SelectItem>
                  <SelectItem value="radio">Radio</SelectItem>
                  <SelectItem value="checkbox">Checkbox</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm">Required</label>
              <Select value={required ? 'yes' : 'no'} onValueChange={(v) => setRequired(v === 'yes')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm">Options (comma separated)</label>
              <Input value={optionsStr} onChange={e => setOptionsStr(e.target.value)} placeholder="VIP, General, Student" />
            </div>
            <div>
              <Button onClick={addQuestion}>
                <Plus className="w-4 h-4 mr-2" /> Add
              </Button>
            </div>
          </div>

          {/* List */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pos</TableHead>
                  <TableHead>Label</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Required</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(questions || []).map((q) => (
                  <TableRow key={q.id}>
                    <TableCell>{q.position}</TableCell>
                    <TableCell>{q.label}</TableCell>
                    <TableCell>{q.type}</TableCell>
                    <TableCell>{q.required ? 'Yes' : 'No'}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => remove(q.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {(!questions || questions.length === 0) && (
            <div className="text-sm text-muted-foreground">No questions yet.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RegistrationQuestionsTab;
