import { useState } from 'react';
import { BookStyle } from '../../models/Book';
import { useProjectStore } from '../../stores/project-store';
import { getStyleById } from '../../data/book-styles';

export function StyleCustomizer() {
  const { project, updateStyleConfig } = useProjectStore();
  const [activeSection, setActiveSection] = useState<
    'heading' | 'body' | 'firstParagraph' | 'dropCap' | 'ornamentalBreak' | 'blockQuote' | 'verse'
  >('heading');

  if (!project) return null;

  const baseStyle = getStyleById(project.styleConfig.selectedStyleId);
  if (!baseStyle) return null;

  const customizations = project.styleConfig.customizations;

  const sections = [
    { id: 'heading' as const, label: 'Headings' },
    { id: 'body' as const, label: 'Body Text' },
    { id: 'firstParagraph' as const, label: 'First Paragraph' },
    { id: 'dropCap' as const, label: 'Drop Cap' },
    { id: 'ornamentalBreak' as const, label: 'Scene Break' },
    { id: 'blockQuote' as const, label: 'Block Quote' },
    { id: 'verse' as const, label: 'Verse/Poetry' },
  ];

  const updateCustomization = (section: keyof typeof customizations, updates: any) => {
    updateStyleConfig({
      customizations: {
        ...customizations,
        [section]: {
          ...customizations[section],
          ...updates,
        },
      },
    });
  };

  const resetSection = (section: keyof typeof customizations) => {
    const newCustomizations = { ...customizations };
    delete newCustomizations[section];
    updateStyleConfig({ customizations: newCustomizations });
  };

  const resetAll = () => {
    updateStyleConfig({ customizations: {} });
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Customize Style</h2>
          <button
            onClick={resetAll}
            className="text-xs text-red-600 dark:text-red-400 hover:underline"
          >
            Reset All
          </button>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Customizing: <span className="font-medium">{baseStyle.name}</span>
        </p>
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 px-2 py-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {sections.map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              activeSection === section.id
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>

      {/* Customization controls */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeSection === 'heading' && (
          <HeadingCustomizer
            baseStyle={baseStyle}
            customizations={customizations.heading || {}}
            onUpdate={updates => updateCustomization('heading', updates)}
            onReset={() => resetSection('heading')}
          />
        )}
        {activeSection === 'body' && (
          <BodyCustomizer
            baseStyle={baseStyle}
            customizations={customizations.body || {}}
            onUpdate={updates => updateCustomization('body', updates)}
            onReset={() => resetSection('body')}
          />
        )}
        {activeSection === 'firstParagraph' && (
          <FirstParagraphCustomizer
            baseStyle={baseStyle}
            customizations={customizations.firstParagraph || {}}
            onUpdate={updates => updateCustomization('firstParagraph', updates)}
            onReset={() => resetSection('firstParagraph')}
          />
        )}
        {activeSection === 'dropCap' && (
          <DropCapCustomizer
            baseStyle={baseStyle}
            customizations={customizations.dropCap || {}}
            onUpdate={updates => updateCustomization('dropCap', updates)}
            onReset={() => resetSection('dropCap')}
          />
        )}
        {activeSection === 'ornamentalBreak' && (
          <OrnamentalBreakCustomizer
            baseStyle={baseStyle}
            customizations={customizations.ornamentalBreak || {}}
            onUpdate={updates => updateCustomization('ornamentalBreak', updates)}
            onReset={() => resetSection('ornamentalBreak')}
          />
        )}
        {activeSection === 'blockQuote' && (
          <BlockQuoteCustomizer
            baseStyle={baseStyle}
            customizations={customizations.blockQuote || {}}
            onUpdate={updates => updateCustomization('blockQuote', updates)}
            onReset={() => resetSection('blockQuote')}
          />
        )}
        {activeSection === 'verse' && (
          <VerseCustomizer
            baseStyle={baseStyle}
            customizations={customizations.verse || {}}
            onUpdate={updates => updateCustomization('verse', updates)}
            onReset={() => resetSection('verse')}
          />
        )}
      </div>
    </div>
  );
}

// Common form components
function FormGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</label>
      {children}
    </div>
  );
}

function NumberInput({
  value,
  onChange,
  min,
  max,
  step = 1,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <input
      type="number"
      value={value}
      onChange={e => onChange(Number(e.target.value))}
      min={min}
      max={max}
      step={step}
      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
    />
  );
}

function SelectInput({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: (checked: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="w-4 h-4 text-primary-600 rounded"
      />
      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
    </label>
  );
}

// Individual customizers
function HeadingCustomizer({
  baseStyle,
  customizations,
  onUpdate,
  onReset,
}: {
  baseStyle: BookStyle;
  customizations: Partial<BookStyle['heading']>;
  onUpdate: (updates: Partial<BookStyle['heading']>) => void;
  onReset: () => void;
}) {
  const current = { ...baseStyle.heading, ...customizations };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Heading Settings</h3>
        {Object.keys(customizations).length > 0 && (
          <button onClick={onReset} className="text-xs text-red-600 dark:text-red-400 hover:underline">
            Reset
          </button>
        )}
      </div>

      <FormGroup label="Font Size (px)">
        <NumberInput value={current.fontSize} onChange={fontSize => onUpdate({ fontSize })} min={12} max={72} />
      </FormGroup>

      <FormGroup label="Font Weight">
        <NumberInput value={current.fontWeight} onChange={fontWeight => onUpdate({ fontWeight })} min={100} max={900} step={100} />
      </FormGroup>

      <FormGroup label="Text Align">
        <SelectInput
          value={current.textAlign}
          onChange={textAlign => onUpdate({ textAlign: textAlign as any })}
          options={[
            { value: 'left', label: 'Left' },
            { value: 'center', label: 'Center' },
            { value: 'right', label: 'Right' },
          ]}
        />
      </FormGroup>

      <FormGroup label="Text Transform">
        <SelectInput
          value={current.textTransform}
          onChange={textTransform => onUpdate({ textTransform: textTransform as any })}
          options={[
            { value: 'none', label: 'None' },
            { value: 'uppercase', label: 'Uppercase' },
            { value: 'lowercase', label: 'Lowercase' },
            { value: 'capitalize', label: 'Capitalize' },
          ]}
        />
      </FormGroup>

      <FormGroup label="Letter Spacing (px)">
        <NumberInput value={current.letterSpacing} onChange={letterSpacing => onUpdate({ letterSpacing })} min={-2} max={10} step={0.5} />
      </FormGroup>

      <FormGroup label="Margin Top (px)">
        <NumberInput value={current.marginTop} onChange={marginTop => onUpdate({ marginTop })} min={0} max={120} />
      </FormGroup>

      <FormGroup label="Margin Bottom (px)">
        <NumberInput value={current.marginBottom} onChange={marginBottom => onUpdate({ marginBottom })} min={0} max={80} />
      </FormGroup>
    </div>
  );
}

function BodyCustomizer({
  baseStyle,
  customizations,
  onUpdate,
  onReset,
}: {
  baseStyle: BookStyle;
  customizations: Partial<BookStyle['body']>;
  onUpdate: (updates: Partial<BookStyle['body']>) => void;
  onReset: () => void;
}) {
  const current = { ...baseStyle.body, ...customizations };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Body Text Settings</h3>
        {Object.keys(customizations).length > 0 && (
          <button onClick={onReset} className="text-xs text-red-600 dark:text-red-400 hover:underline">
            Reset
          </button>
        )}
      </div>

      <FormGroup label="Font Size (px)">
        <NumberInput value={current.fontSize} onChange={fontSize => onUpdate({ fontSize })} min={10} max={24} />
      </FormGroup>

      <FormGroup label="Line Height">
        <NumberInput value={current.lineHeight} onChange={lineHeight => onUpdate({ lineHeight })} min={1} max={3} step={0.1} />
      </FormGroup>

      <FormGroup label="Text Align">
        <SelectInput
          value={current.textAlign}
          onChange={textAlign => onUpdate({ textAlign: textAlign as any })}
          options={[
            { value: 'left', label: 'Left' },
            { value: 'justify', label: 'Justify' },
          ]}
        />
      </FormGroup>

      <FormGroup label="Paragraph Spacing (px)">
        <NumberInput value={current.paragraphSpacing} onChange={paragraphSpacing => onUpdate({ paragraphSpacing })} min={0} max={40} />
      </FormGroup>

      <FormGroup label="First Line Indent (px)">
        <NumberInput value={current.firstLineIndent} onChange={firstLineIndent => onUpdate({ firstLineIndent })} min={0} max={60} />
      </FormGroup>
    </div>
  );
}

function FirstParagraphCustomizer({
  baseStyle,
  customizations,
  onUpdate,
  onReset,
}: {
  baseStyle: BookStyle;
  customizations: Partial<BookStyle['firstParagraph']>;
  onUpdate: (updates: Partial<BookStyle['firstParagraph']>) => void;
  onReset: () => void;
}) {
  const current = { ...baseStyle.firstParagraph, ...customizations };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">First Paragraph Settings</h3>
        {Object.keys(customizations).length > 0 && (
          <button onClick={onReset} className="text-xs text-red-600 dark:text-red-400 hover:underline">
            Reset
          </button>
        )}
      </div>

      <FormGroup label="Options">
        <div className="space-y-2">
          <Checkbox checked={current.dropCap} onChange={dropCap => onUpdate({ dropCap })} label="Enable Drop Cap" />
          <Checkbox checked={current.smallCaps} onChange={smallCaps => onUpdate({ smallCaps })} label="Use Small Caps" />
        </div>
      </FormGroup>

      <FormGroup label="Font Size (px)">
        <NumberInput value={current.fontSize} onChange={fontSize => onUpdate({ fontSize })} min={10} max={24} />
      </FormGroup>
    </div>
  );
}

function DropCapCustomizer({
  baseStyle,
  customizations,
  onUpdate,
  onReset,
}: {
  baseStyle: BookStyle;
  customizations: Partial<BookStyle['dropCap']>;
  onUpdate: (updates: Partial<BookStyle['dropCap']>) => void;
  onReset: () => void;
}) {
  const current = { ...baseStyle.dropCap, ...customizations };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Drop Cap Settings</h3>
        {Object.keys(customizations).length > 0 && (
          <button onClick={onReset} className="text-xs text-red-600 dark:text-red-400 hover:underline">
            Reset
          </button>
        )}
      </div>

      <FormGroup label="Options">
        <Checkbox checked={current.enabled} onChange={enabled => onUpdate({ enabled })} label="Enable Drop Cap" />
      </FormGroup>

      {current.enabled && (
        <>
          <FormGroup label="Number of Lines">
            <NumberInput value={current.lines} onChange={lines => onUpdate({ lines })} min={2} max={6} />
          </FormGroup>
        </>
      )}
    </div>
  );
}

function OrnamentalBreakCustomizer({
  baseStyle,
  customizations,
  onUpdate,
  onReset,
}: {
  baseStyle: BookStyle;
  customizations: Partial<BookStyle['ornamentalBreak']>;
  onUpdate: (updates: Partial<BookStyle['ornamentalBreak']>) => void;
  onReset: () => void;
}) {
  const current = { ...baseStyle.ornamentalBreak, ...customizations };

  const symbolOptions = [
    { value: '***', label: '*** (Asterisks)' },
    { value: '* * *', label: '* * * (Spaced Asterisks)' },
    { value: '◆  ◆  ◆', label: '◆  ◆  ◆ (Diamonds)' },
    { value: '~ ~ ~', label: '~ ~ ~ (Tildes)' },
    { value: '• • •', label: '• • • (Bullets)' },
    { value: '◦ ◦ ◦', label: '◦ ◦ ◦ (Circles)' },
    { value: '—', label: '— (Em Dash)' },
    { value: '§', label: '§ (Section)' },
    { value: '❦', label: '❦ (Fleuron)' },
    { value: '♦ ♦ ♦', label: '♦ ♦ ♦ (Card Diamonds)' },
    { value: '▪', label: '▪ (Square)' },
    { value: '>>>', label: '>>> (Arrows)' },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Scene Break Settings</h3>
        {Object.keys(customizations).length > 0 && (
          <button onClick={onReset} className="text-xs text-red-600 dark:text-red-400 hover:underline">
            Reset
          </button>
        )}
      </div>

      <FormGroup label="Symbol">
        <SelectInput
          value={current.symbol}
          onChange={symbol => onUpdate({ symbol })}
          options={symbolOptions}
        />
      </FormGroup>

      <FormGroup label="Font Size (px)">
        <NumberInput value={current.fontSize} onChange={fontSize => onUpdate({ fontSize })} min={10} max={32} />
      </FormGroup>

      <FormGroup label="Spacing (px)">
        <NumberInput value={current.spacing} onChange={spacing => onUpdate({ spacing })} min={16} max={80} />
      </FormGroup>
    </div>
  );
}

function BlockQuoteCustomizer({
  baseStyle,
  customizations,
  onUpdate,
  onReset,
}: {
  baseStyle: BookStyle;
  customizations: Partial<BookStyle['blockQuote']>;
  onUpdate: (updates: Partial<BookStyle['blockQuote']>) => void;
  onReset: () => void;
}) {
  const current = { ...baseStyle.blockQuote, ...customizations };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Block Quote Settings</h3>
        {Object.keys(customizations).length > 0 && (
          <button onClick={onReset} className="text-xs text-red-600 dark:text-red-400 hover:underline">
            Reset
          </button>
        )}
      </div>

      <FormGroup label="Font Size (px)">
        <NumberInput value={current.fontSize} onChange={fontSize => onUpdate({ fontSize })} min={10} max={24} />
      </FormGroup>

      <FormGroup label="Font Style">
        <SelectInput
          value={current.fontStyle}
          onChange={fontStyle => onUpdate({ fontStyle: fontStyle as any })}
          options={[
            { value: 'normal', label: 'Normal' },
            { value: 'italic', label: 'Italic' },
          ]}
        />
      </FormGroup>

      <FormGroup label="Margin Left (px)">
        <NumberInput value={current.marginLeft} onChange={marginLeft => onUpdate({ marginLeft })} min={0} max={80} />
      </FormGroup>

      <FormGroup label="Margin Right (px)">
        <NumberInput value={current.marginRight} onChange={marginRight => onUpdate({ marginRight })} min={0} max={80} />
      </FormGroup>

      <FormGroup label="Options">
        <Checkbox checked={current.borderLeft} onChange={borderLeft => onUpdate({ borderLeft })} label="Show Left Border" />
      </FormGroup>
    </div>
  );
}

function VerseCustomizer({
  baseStyle,
  customizations,
  onUpdate,
  onReset,
}: {
  baseStyle: BookStyle;
  customizations: Partial<BookStyle['verse']>;
  onUpdate: (updates: Partial<BookStyle['verse']>) => void;
  onReset: () => void;
}) {
  const current = { ...baseStyle.verse, ...customizations };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Verse/Poetry Settings</h3>
        {Object.keys(customizations).length > 0 && (
          <button onClick={onReset} className="text-xs text-red-600 dark:text-red-400 hover:underline">
            Reset
          </button>
        )}
      </div>

      <FormGroup label="Font Size (px)">
        <NumberInput value={current.fontSize} onChange={fontSize => onUpdate({ fontSize })} min={10} max={24} />
      </FormGroup>

      <FormGroup label="Font Style">
        <SelectInput
          value={current.fontStyle}
          onChange={fontStyle => onUpdate({ fontStyle: fontStyle as any })}
          options={[
            { value: 'normal', label: 'Normal' },
            { value: 'italic', label: 'Italic' },
          ]}
        />
      </FormGroup>

      <FormGroup label="Text Align">
        <SelectInput
          value={current.textAlign}
          onChange={textAlign => onUpdate({ textAlign: textAlign as any })}
          options={[
            { value: 'left', label: 'Left' },
            { value: 'center', label: 'Center' },
            { value: 'right', label: 'Right' },
          ]}
        />
      </FormGroup>
    </div>
  );
}
