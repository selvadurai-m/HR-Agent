import React, { useEffect, useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { InterviewType } from '@/services/Constants';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { ArrowRight } from 'lucide-react';

function FormContainer({ onHandleInputChange, GoToNext }) {
  const [interviewType, setInterviewType] = useState([]);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip first render to avoid unnecessary updates
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    onHandleInputChange('type', interviewType);
  }, [interviewType, onHandleInputChange]);

  const AddInterviewType = (name) => {
    const isSelected = interviewType.includes(name);
    if (!isSelected) {
      setInterviewType((prev) => [...prev, name]);
    } else {
      const result = interviewType.filter((item) => item !== name);
      setInterviewType(result);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="text-sm font-medium text-gray-700">
          Job Position <span className="text-red-500">*</span>
        </label>
        <Input
          placeholder="e.g. Software Engineer"
          className="mt-2"
          onChange={(event) => {
            onHandleInputChange('job_position', event.target.value);
          }}
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">
          Job Description <span className="text-red-500">*</span>
        </label>
        <Textarea
          placeholder="Enter detailed job description"
          className="h-45 mt-2"
          onChange={(event) => {
            onHandleInputChange('job_description', event.target.value);
          }}
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">
          Interview Duration <span className="text-red-500">*</span>
        </label>
        <Select
          onValueChange={(value) => {
            onHandleInputChange('duration', value);
          }}
        >
          <SelectTrigger className="w-full mt-2">
            <SelectValue placeholder="Select Duration" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="15 Min">15 Min</SelectItem>
            <SelectItem value="30 Min">30 Min</SelectItem>
            <SelectItem value="45 Min">45 Min</SelectItem>
            <SelectItem value="60 Min">60 Min</SelectItem>
            <SelectItem value="120 Min">120 Min</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">
          Interview Type <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2 flex-wrap mt-2">
          {InterviewType.map((type, index) => (
            <button
              key={index}
              type="button"
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${interviewType.includes(type.name)
                ? 'bg-violet-100 border-violet-300 text-violet-700'
                : 'bg-white border-gray-200 text-gray-600 hover:border-violet-200 hover:bg-violet-50/50'
                }`}
              onClick={() => AddInterviewType(type.name)}
            >
              <type.icon className="h-4 w-4" />
              <span className="text-sm font-medium">{type.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-6 border-t border-gray-100">
        <Button onClick={() => GoToNext()} variant="gradient" size="lg">
          Generate Questions
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export default FormContainer;
