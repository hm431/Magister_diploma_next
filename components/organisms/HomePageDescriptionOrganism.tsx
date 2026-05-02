import { DescriptionTextMolecule } from '@/components/molecules/DescriptionTextMolecule';
import { DescriptionSchemaMolecule } from '@/components/molecules/DescriptionSchemaMolecule';

export function HomePageDescriptionOrganism() {
  return (
    <div className="flex w-full gap-10">
      <DescriptionTextMolecule />
      <DescriptionSchemaMolecule />
    </div>
  );
}