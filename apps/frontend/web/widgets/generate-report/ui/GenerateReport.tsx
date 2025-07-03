import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/DIalog';
import { Button } from '@/shared/ui';
import Label from '@/shared/ui/Label';
import { RadioGroup, RadioGroupItem } from '@/shared/ui/RadioGroup';
import { useState } from 'react';
import { GetReportDialog } from '@/widgets/get-report-dialog/ui';

export const GenerateReport = () => {
  const [reportType, setReportType] = useState('single');

  const handleReportTypeChange = (value: string) => {
    setReportType(value);
    console.log('Selected report type:', value);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="bg-teal-900 text-white mt-4 px-10 hover:bg-teal-700"
        >
          Generate Report
        </Button>
      </DialogTrigger>
      <DialogContent hideCloseButton className="sm:max-w-[425px] p-0">
        <DialogHeader className="bg-teal-900 p-4">
          <DialogTitle className="font-bold text-white">
            Generate report
          </DialogTitle>
        </DialogHeader>
        <div className="px-4">
          <div className="font-bold text-xl mb-4">
            Please select report type
          </div>
          <RadioGroup value={reportType} onValueChange={handleReportTypeChange}>
            <div className="flex flex-col gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="r1" />
                <Label htmlFor="r1">All risks</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="single" id="r2" />
                <Label htmlFor="r2">Single matter</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="byType" id="r3" />
                <Label htmlFor="r3">Risk type e.g. contract, litigation</Label>
              </div>
            </div>
          </RadioGroup>
        </div>
        <DialogFooter className="p-4">
          <GetReportDialog />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
