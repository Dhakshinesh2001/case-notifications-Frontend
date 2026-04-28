import { View } from 'react-native';
import EditableField from '@/components/case/EditableField';
import { CaseService } from '@/features/case/case.service';

export default function CaseHeader({ caseData, onUpdate }: any) {
  const update = (field: string, value: string) => {
    CaseService.updateCase(caseData.id, {
      [field]: value,
    });
    onUpdate();
  };

  return (
    <View style={{ marginBottom: 20 }}>
      <EditableField
        label="Title"
        value={caseData.title}
        onSave={(v: string) => update('title', v)}
        style={{
          fontSize: 20,
          fontWeight: 'bold',
        }}
      />

      <EditableField
        label="Case Number"
        value={caseData.caseNumber}
        onSave={(v: string) => update('caseNumber', v)}
        style={{ fontSize: 14 }}
      />

      <EditableField
        label="Court"
        value={caseData.court}
        onSave={(v: string) => update('court', v)}
      />

      <EditableField
        label="Status"
        value={caseData.status}
        onSave={(v: string) => update('status', v)}
      />

      <EditableField
        label="Description"
        value={caseData.description}
        onSave={(v: string) => update('description', v)}
        multiline
        style={{ color: '#444' }}
      />
    </View>
  );
}