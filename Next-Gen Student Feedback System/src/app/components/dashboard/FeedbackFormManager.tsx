import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { GlassCard } from '../ui/GlassCard';
import { toast } from 'sonner';
import { FeedbackForm, FeedbackQuestion, Course, Department } from '../../types';
import { getCourses, getFeedbackForms, addFeedbackForm, updateFeedbackForm } from '../../utils/storage';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';

export const FeedbackFormManager = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [feedbackForms, setFeedbackForms] = useState<FeedbackForm[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [formName, setFormName] = useState('');
  const [questions, setQuestions] = useState<FeedbackQuestion[]>([]);
  const [editingForm, setEditingForm] = useState<FeedbackForm | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const allCourses = await getCourses();
    const allForms = await getFeedbackForms();
    setCourses(allCourses);
    setFeedbackForms(allForms);
  };

  const addQuestion = () => {
    const newQuestion: FeedbackQuestion = {
      id: crypto.randomUUID(),
      type: 'rating',
      question: '',
      required: false
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id: string, updates: Partial<FeedbackQuestion>) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleCreateForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse || !formName || questions.length === 0) {
      toast.error('Please fill all required fields and add at least one question');
      return;
    }

    setLoading(true);
    try {
      const course = courses.find(c => c.id === selectedCourse);
      if (!course) throw new Error('Course not found');

      const form: FeedbackForm = {
        id: crypto.randomUUID(),
        name: formName,
        courseId: selectedCourse,
        facultyId: course.facultyId,
        department: course.department,
        questions: questions.filter(q => q.question.trim() !== ''),
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await addFeedbackForm(form);
      toast.success('Feedback form created successfully');
      resetForm();
      fetchData();
    } catch (e) {
      toast.error('Failed to create feedback form');
    } finally {
      setLoading(false);
    }
  };

  const handleEditForm = (form: FeedbackForm) => {
    setEditingForm(form);
    setSelectedCourse(form.courseId);
    setFormName(form.name);
    setQuestions(form.questions);
  };

  const handleUpdateForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingForm) return;

    setLoading(true);
    try {
      const updatedForm = {
        ...editingForm,
        name: formName,
        questions: questions.filter(q => q.question.trim() !== ''),
        updatedAt: new Date().toISOString()
      };

      await updateFeedbackForm(editingForm.id, updatedForm);
      toast.success('Feedback form updated successfully');
      resetForm();
      fetchData();
    } catch (e) {
      toast.error('Failed to update feedback form');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingForm(null);
    setSelectedCourse('');
    setFormName('');
    setQuestions([]);
  };

  const toggleFormStatus = async (form: FeedbackForm) => {
    try {
      await updateFeedbackForm(form.id, { isActive: !form.isActive });
      toast.success(`Form ${form.isActive ? 'deactivated' : 'activated'} successfully`);
      fetchData();
    } catch (e) {
      toast.error('Failed to update form status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Creator */}
        <GlassCard>
          <h3 className="text-lg font-bold text-[#2E2E4D] mb-4">
            {editingForm ? 'Edit Feedback Form' : 'Create Feedback Form'}
          </h3>
          <form onSubmit={editingForm ? handleUpdateForm : handleCreateForm} className="space-y-4">
            <div>
              <label className="block text-sm text-[#6B6B8A] mb-1">Course</label>
              <select 
                className="w-full bg-white border-2 border-[#E9E6F7] rounded-xl p-3 text-[#2E2E4D] focus:outline-none focus:ring-2 focus:ring-[#7A6AD8]/30 focus:border-[#7A6AD8]"
                value={selectedCourse} 
                onChange={e => setSelectedCourse(e.target.value)}
                disabled={!!editingForm}
                required
              >
                <option value="">Select a course</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.code} - {course.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-[#6B6B8A] mb-1">Form Name</label>
              <Input 
                value={formName} 
                onChange={e => setFormName(e.target.value)} 
                placeholder="e.g., Mid-term Feedback Form"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm text-[#6B6B8A]">Questions</label>
                <Button 
                  type="button" 
                  onClick={addQuestion}
                  className="text-xs px-3 py-1"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Question
                </Button>
              </div>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {questions.map((question, index) => (
                  <div key={question.id} className="bg-[#F8F9FD] p-3 rounded-xl border border-[#E9E6F7]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-[#2E2E4D]">Question {index + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeQuestion(question.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      <Input
                        value={question.question}
                        onChange={e => updateQuestion(question.id, { question: e.target.value })}
                        placeholder="Enter your question..."
                        required
                      />
                      
                      <div className="flex items-center gap-4">
                        <select 
                          className="flex-1 bg-white border border-[#E9E6F7] rounded-lg p-2 text-sm text-[#2E2E4D] focus:outline-none focus:ring-2 focus:ring-[#7A6AD8]/30"
                          value={question.type}
                          onChange={e => updateQuestion(question.id, { type: e.target.value as FeedbackQuestion['type'] })}
                        >
                          <option value="rating">Rating (1-5)</option>
                          <option value="text">Text Answer</option>
                          <option value="multiple">Multiple Choice</option>
                        </select>
                        
                        <label className="flex items-center gap-2 text-sm text-[#6B6B8A]">
                          <input
                            type="checkbox"
                            checked={question.required}
                            onChange={e => updateQuestion(question.id, { required: e.target.checked })}
                            className="rounded border-[#E9E6F7]"
                          />
                          Required
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" isLoading={loading} className="flex-1">
                {editingForm ? 'Update Form' : 'Create Form'}
              </Button>
              {editingForm && (
                <Button 
                  type="button" 
                  onClick={resetForm}
                  variant="outline"
                  className="px-4"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </form>
        </GlassCard>

        {/* Existing Forms */}
        <GlassCard>
          <h3 className="text-lg font-bold text-[#2E2E4D] mb-4">Existing Feedback Forms ({feedbackForms.length})</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {feedbackForms.map(form => {
              const course = courses.find(c => c.id === form.courseId);
              return (
                <div key={form.id} className="bg-[#F8F9FD] p-4 rounded-xl border border-[#E9E6F7]">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-[#2E2E4D]">{form.name}</h4>
                      <p className="text-sm text-[#6B6B8A]">
                        {course ? `${course.code} - ${course.title}` : 'Course not found'}
                      </p>
                      <p className="text-xs text-[#9C8ADE]">
                        {form.questions.length} questions • {form.department}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      form.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {form.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditForm(form)}
                      className="text-xs bg-[#7A6AD8] hover:bg-[#5B4FCF] text-white px-3 py-1 rounded transition-colors flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      Edit
                    </button>
                    <button
                      onClick={() => toggleFormStatus(form)}
                      className={`text-xs px-3 py-1 rounded transition-colors ${
                        form.isActive 
                          ? 'bg-red-500 hover:bg-red-600 text-white' 
                          : 'bg-green-500 hover:bg-green-600 text-white'
                      }`}
                    >
                      {form.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>
              );
            })}
            
            {feedbackForms.length === 0 && (
              <div className="text-center py-8 text-[#9C8ADE]">
                <p>No feedback forms found. Create your first form.</p>
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
