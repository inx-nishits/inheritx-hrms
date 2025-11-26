"use client";

import React, { useState, useId, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { NextUISelect } from '@/components/ui/NextUISelect';
import { Button } from '@/components/ui/Button';
import { InfoTooltip } from '@/components/ui/Tooltip';
import { IndianRupee, Save, X, CheckCircle2 } from 'lucide-react';

interface CompensationData {
  enablePayroll: boolean;
  payGroup: string;
  annualSalary: string;
  salaryPeriod: 'per-annum' | 'per-month';
  salaryEffectiveFrom: string;
  regularSalary: string;
  bonus: string;
  bonusIncludedInAnnual: boolean;
  pfEligible: boolean;
  esiApplicable: boolean;
  salaryStructureType: string;
  taxRegime: string;
}

interface CompensationSectionProps {
  data: CompensationData;
  onChange: (field: keyof CompensationData, value: any) => void;
  errors: Partial<Record<keyof CompensationData, string>>;
  onSave: () => void;
  saving: boolean;
  isEmployee?: boolean;
}

export function CompensationSection({
  data,
  onChange,
  errors,
  onSave,
  saving,
  isEmployee = false,
}: CompensationSectionProps) {
  const [showDetailedBreakup, setShowDetailedBreakup] = useState(false);
  const [bonuses, setBonuses] = useState<Array<{ id: string; type: string; amount: string; frequency: string; effectiveDate: string }>>([]);
  const baseId = useId();
  const bonusCounterRef = React.useRef(0);

  const handleAddBonus = () => {
    setBonuses([...bonuses, {
      id: `${baseId}-bonus-${bonusCounterRef.current++}`,
      type: '',
      amount: '',
      frequency: '',
      effectiveDate: '',
    }]);
  };

  const handleRemoveBonus = (id: string) => {
    setBonuses(bonuses.filter(b => b.id !== id));
  };

  const calculateTotal = () => {
    const regular = parseFloat(data.regularSalary) || 0;
    const bonusTotal = bonuses.reduce((sum, b) => sum + (parseFloat(b.amount) || 0), 0);
    return regular + bonusTotal;
  };

  if (isEmployee) {
    // Employee-side: Read-only view
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle className="flex items-center gap-2">
              <IndianRupee className="h-5 w-5 text-primary" />
              Compensation
            </CardTitle>
            <InfoTooltip content="Salary details are managed by HR. Contact HR to request a review." />
          </div>
          <CardDescription>
            Your salary and payroll information (read-only)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-foreground">Pay Group</label>
              <div className="p-3 bg-muted/50 rounded-[8px] border border-border/50">
                <span className="text-sm text-foreground">{data.payGroup || 'Not set'}</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-foreground">Annual Salary</label>
              <div className="p-3 bg-muted/50 rounded-[8px] border border-border/50">
                <span className="text-sm text-foreground">
                  {data.annualSalary ? `INR ${parseFloat(data.annualSalary).toLocaleString()}` : 'Not set'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-muted/30 rounded-[8px] border border-border/50">
            <h4 className="text-sm font-semibold text-foreground mb-3">Salary Breakup</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Regular Salary</span>
                <span className="font-semibold text-foreground">
                  {data.regularSalary ? `INR ${parseFloat(data.regularSalary).toLocaleString()}` : '—'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Bonus</span>
                <span className="font-semibold text-foreground">
                  {data.bonus ? `INR ${parseFloat(data.bonus).toLocaleString()}` : '—'}
                </span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-border/50">
                <span className="font-semibold text-foreground">Total</span>
                <span className="font-bold text-foreground">
                  INR {calculateTotal().toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground text-center pt-2">
            Salary details are managed by HR. Contact HR to request a review.
          </div>
        </CardContent>
      </Card>
    );
  }

  // Admin-side: Editable view
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle className="flex items-center gap-2">
            <IndianRupee className="h-5 w-5 text-primary" />
            Compensation
          </CardTitle>
          <InfoTooltip content="Add or review salary and payroll settings for this employee. These details determine payroll calculation, PF/ESI eligibility, and applicable tax regime." />
        </div>
        <CardDescription>
          Configure salary, payroll settings, and tax information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable Payroll Toggle */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label className="block text-sm font-semibold text-foreground">
              Enable payroll for this employee
            </label>
            <InfoTooltip content="Turn ON to include this employee in monthly payroll processing." />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onChange('enablePayroll', !data.enablePayroll)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                data.enablePayroll ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  data.enablePayroll ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className="text-sm text-muted-foreground">
              {data.enablePayroll ? 'Payroll enabled' : 'Payroll disabled'}
            </span>
          </div>
          {!data.enablePayroll && (
            <p className="text-xs text-muted-foreground">
              Payroll will not be processed for this employee unless enabled.
            </p>
          )}
        </div>

        {/* Pay Group */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label className="block text-sm font-semibold text-foreground">
              Pay Group
            </label>
            <InfoTooltip content="A pay group defines payroll cycle, ESI/PF applicability, and pay frequency. Select one that applies to this employee." />
            <span className="text-red-500 ml-1">*</span>
          </div>
          <NextUISelect
            placeholder="Select pay group"
            value={data.payGroup}
            onChange={(value) => onChange('payGroup', value)}
            options={['Standard Pay Group', 'Executive Pay Group', 'Contractor Pay Group']}
            error={errors.payGroup}
          />
        </div>

        {/* Annual Salary */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label className="block text-sm font-semibold text-foreground">
              Annual Salary
            </label>
            <InfoTooltip content="Enter total gross salary. This includes all regular earnings before deductions." />
            <span className="text-red-500 ml-1">*</span>
          </div>
          <div className="flex gap-2">
            <Input
              type="number"
              value={data.annualSalary}
              onChange={(e) => onChange('annualSalary', e.target.value)}
              placeholder="Enter amount"
              error={errors.annualSalary}
              className="flex-1"
              required
            />
            <NextUISelect
              placeholder="Select period"
              value={data.salaryPeriod}
              onChange={(value) => onChange('salaryPeriod', value)}
              options={[
                { value: 'per-annum', label: 'Per annum' },
                { value: 'per-month', label: 'Per month' }
              ]}
              classNames={{
                base: "w-32",
              }}
            />
          </div>
        </div>

        {/* Salary Breakup Card */}
        <div className="p-4 bg-muted/30 rounded-[8px] border border-border/50">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-foreground">Salary Breakup</h4>
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground">Detailed Breakup</label>
              <button
                type="button"
                onClick={() => setShowDetailedBreakup(!showDetailedBreakup)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  showDetailedBreakup ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                    showDetailedBreakup ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {showDetailedBreakup && (
            <div className="space-y-4 pt-4 border-t border-border/50">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="block text-sm font-semibold text-foreground">
                    Regular Salary
                  </label>
                  <InfoTooltip content="Fixed monthly salary amount before any bonuses." />
                </div>
                <Input
                  type="number"
                  value={data.regularSalary}
                  onChange={(e) => onChange('regularSalary', e.target.value)}
                  placeholder="Enter regular salary"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label className="block text-sm font-semibold text-foreground">
                      Bonus
                    </label>
                    <InfoTooltip content="Variable or performance-based pay component." />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddBonus}
                  >
                    + Add Bonus
                  </Button>
                </div>
                {bonuses.map((bonus) => (
                  <div key={bonus.id} className="flex gap-2 items-end">
                    <NextUISelect
                      placeholder="Bonus type"
                      value={bonus.type}
                      onChange={(value) => {
                        const updated = bonuses.map(b =>
                          b.id === bonus.id ? { ...b, type: value || '' } : b
                        );
                        setBonuses(updated);
                      }}
                      options={['Performance Bonus', 'Annual Bonus', 'Retention Bonus']}
                      classNames={{
                        base: "flex-1",
                      }}
                    />
                    <Input
                      type="number"
                      value={bonus.amount}
                      onChange={(e) => {
                        const updated = bonuses.map(b =>
                          b.id === bonus.id ? { ...b, amount: e.target.value } : b
                        );
                        setBonuses(updated);
                      }}
                      placeholder="Amount"
                      className="flex-1"
                    />
                    <Input
                      type="date"
                      value={bonus.effectiveDate}
                      onChange={(e) => {
                        const updated = bonuses.map(b =>
                          b.id === bonus.id ? { ...b, effectiveDate: e.target.value } : b
                        );
                        setBonuses(updated);
                      }}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveBonus(bonus.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="bonus-included"
                    checked={data.bonusIncludedInAnnual}
                    onChange={(e) => onChange('bonusIncludedInAnnual', e.target.checked)}
                    className="h-4 w-4 rounded border-input"
                  />
                  <label htmlFor="bonus-included" className="text-sm text-foreground">
                    Bonus amount is included in the annual salary of INR {data.annualSalary || '0'}
                  </label>
                  <InfoTooltip content="Check if the bonus is already part of the total annual salary figure." />
                </div>
              </div>

              <div className="pt-4 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">Total</span>
                  <InfoTooltip content="Sum of regular salary and applicable bonuses." />
                  <span className="text-lg font-bold text-foreground">
                    INR {calculateTotal().toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {!showDetailedBreakup && (
            <div className="space-y-2 pt-4 border-t border-border/50">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Regular Salary</span>
                <span className="font-semibold text-foreground">
                  {data.regularSalary ? `INR ${parseFloat(data.regularSalary).toLocaleString()}` : '—'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Bonus</span>
                <span className="font-semibold text-foreground">
                  {data.bonus ? `INR ${parseFloat(data.bonus).toLocaleString()}` : '—'}
                </span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-border/50">
                <span className="font-semibold text-foreground">Total</span>
                <span className="font-bold text-foreground">
                  INR {calculateTotal().toLocaleString()}
                </span>
              </div>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-border/50">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-foreground">
                Salary Effective From
              </label>
              <InfoTooltip content="The date from which this salary structure will take effect. Past-dated changes will adjust payroll accordingly." />
              <Input
                type="date"
                value={data.salaryEffectiveFrom}
                onChange={(e) => onChange('salaryEffectiveFrom', e.target.value)}
                placeholder="Select date"
              />
            </div>
          </div>
        </div>

        {/* Payroll Settings */}
        <div className="space-y-4 pt-4 border-t border-border/50">
          <h4 className="text-sm font-semibold text-foreground">Payroll Settings</h4>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="pf-eligible"
              checked={data.pfEligible}
              onChange={(e) => onChange('pfEligible', e.target.checked)}
              className="h-4 w-4 rounded border-input"
            />
            <label htmlFor="pf-eligible" className="text-sm text-foreground">
              Provident fund (PF) eligible
            </label>
            <InfoTooltip content="Check if this employee qualifies for PF contributions as per company policy." />
          </div>

          {!data.esiApplicable && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-[8px]">
              <p className="text-xs text-amber-800 dark:text-amber-200">
                ESI is not applicable for the selected Pay Group
              </p>
              <InfoTooltip content="Employee State Insurance (ESI) coverage depends on the selected pay group and salary limits." />
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="block text-sm font-semibold text-foreground">
                Salary Structure Type
              </label>
              <InfoTooltip content="Defines how salary components are distributed. 'Range Based' follows preset salary ranges, while 'Custom' allows manual adjustments." />
            </div>
            <NextUISelect
              placeholder="Select salary structure type"
              value={data.salaryStructureType}
              onChange={(value) => onChange('salaryStructureType', value)}
              options={['Range Based', 'Component Based', 'Custom']}
              error={errors.salaryStructureType}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="block text-sm font-semibold text-foreground">
                Tax Regime to Consider
              </label>
              <InfoTooltip content="Select the tax regime to calculate deductions as per employee's declaration. Employees can change this preference annually before financial year closure." />
            </div>
            <NextUISelect
              placeholder="Select tax regime"
              value={data.taxRegime}
              onChange={(value) => onChange('taxRegime', value)}
              options={['Old Regime', 'New Regime (Section 115BAC)']}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-6 border-t border-border/50">
          <Button
            type="button"
            variant="outline"
            onClick={() => {/* Skip logic */}}
          >
            Skip this Step
          </Button>
          <Button
            type="button"
            onClick={onSave}
            loading={saving}
            loadingText="Saving..."
          >
            <Save className="h-4 w-4" />
            Finish
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

