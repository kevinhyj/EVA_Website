export interface RNAType {
  id: string;
  name: string;
  desc: string;
  //briefDesc: string;  //功能入口的简要描述
  col: string;
  tag: string;
  species?: string[];
  examples?: RNAExample[];
  achievements?: RNAAchievement[];
  visualizations?: RNAVisualization[];
}

export interface RNAExample {
  title: string;
  sequence: string;
  species: string;
  source: string;
  description: string;
}

export interface RNAAchievement {
  title: string;
  metric: string;
  value: string;
  description: string;
  paper?: string;
}

export interface RNAVisualization {
  title: string;
  description: string;
  imagePath: string;
  imageAlt: string;
}

/* ---------- Per-RNA species lists ---------- */
const SPECIES_HUMAN_MODEL = ['Homo sapiens', 'Mus musculus', 'Rattus norvegicus', 'Danio rerio', 'Drosophila melanogaster', 'Caenorhabditis elegans'];
const SPECIES_BROAD = ['Homo sapiens', 'Mus musculus', 'Arabidopsis thaliana', 'Saccharomyces cerevisiae', 'Escherichia coli'];
const SPECIES_BACTERIAL = ['Escherichia coli', 'Bacillus subtilis', 'Pseudomonas aeruginosa', 'Staphylococcus aureus', 'Salmonella enterica'];
const SPECIES_VIRAL = ['SARS-CoV-2', 'Influenza A', 'HIV-1', 'Hepatitis C', 'Ebola virus', 'Zika virus'];

/* ---------- Species to NCBI TaxID mapping ---------- */
export const SPECIES_TAXID_MAP: Record<string, number> = {
  // Eukaryotes
  'Homo sapiens': 9606,
  'Mus musculus': 10090,
  'Rattus norvegicus': 10116,
  'Danio rerio': 7955,
  'Drosophila melanogaster': 7227,
  'Caenorhabditis elegans': 6239,
  'Arabidopsis thaliana': 3702,
  'Saccharomyces cerevisiae': 4932,
  // Bacteria
  'Escherichia coli': 562,
  'Bacillus subtilis': 224308,
  'Pseudomonas aeruginosa': 287,
  'Staphylococcus aureus': 1280,
  'Salmonella enterica': 28901,
  // Viruses
  'SARS-CoV-2': 2697049,
  'Influenza A': 11320,
  'HIV-1': 11676,
  'Hepatitis C': 11103,
  'Ebola virus': 186539,
  'Zika virus': 64320,
};

/* ---------- Mock example sequences (short fragments) ---------- */
function mockSeq(len: number): string {
  const bases = 'AUGC';
  let s = '';
  for (let i = 0; i < len; i++) s += bases[Math.floor(Math.random() * 4)];
  return s;
}

// Pre-generated stable sequences for deterministic display
const EXAMPLE_SEQ_SHORT = 'AUGCUAGCUAGCUAGCUAGCUAGCUAGCUAGCUAGCUAGCUAGCUAGCUAGC';
const EXAMPLE_SEQ_MEDIUM = 'AUGCGAUUCGAACGUAACGCUUAGCGUAGCUAGCGAUUCGAACGUAACGCUUAGCGUAGCUAGCGAUUCGAACGUAACGCUUAGCGUAGCU';
const EXAMPLE_SEQ_MASK = 'AUGCUAGC<mask>UAGCUAGC<mask>UAGCUAGCUAGC';

export const RNA_TYPES: RNAType[] = [
  {
    id: 'mRNA', name: 'mRNA Design', col: '#00c8e0', tag: 'Coding RNA',
    desc: 'Messenger RNA optimization for vaccines, therapeutics & protein expression engineering.',
    species: SPECIES_HUMAN_MODEL,
    examples: [
      { title: 'GFP mRNA Optimization', sequence: EXAMPLE_SEQ_MEDIUM, species: 'Homo sapiens', source: 'Nature Biotechnology 2024', description: 'Codon-optimized GFP mRNA with enhanced translation efficiency.' },
      { title: 'Spike Protein mRNA', sequence: EXAMPLE_SEQ_SHORT, species: 'Homo sapiens', source: 'Cell 2023', description: 'Modified spike protein mRNA for vaccine development.' },
    ],
    achievements: [
      { title: 'Translation Efficiency', metric: 'Improvement', value: '+45%', description: 'Average improvement in protein expression over wild-type sequences.', paper: '#' },
      { title: 'Stability Score', metric: 'Half-life', value: '12h', description: 'Extended mRNA stability through optimized UTR design.', paper: '#' },
      { title: 'Codon Adaptation', metric: 'CAI', value: '0.95', description: 'Near-optimal codon adaptation index across human codons.', paper: '#' },
    ],
    visualizations: [
      { title: 'mRNA Distribution Analysis', description: 'Distributional comparisons between AI generated RNAs and natural RNAs.', imagePath: '/eva1/output/mRNA_comparison.webp', imageAlt: 'mRNA distribution comparison' },
      { title: 'circRNA Distribution Analysis', description: 'Distributional comparisons between AI generated RNAs and natural RNAs.', imagePath: '/eva1/output/circRNA_comparison.webp', imageAlt: 'circRNA distribution comparison' },
    ],
  },
  {
    id: 'tRNA', name: 'tRNA Design', col: '#e89030', tag: 'Non-coding RNA',
    desc: 'Transfer RNA engineering for expanding genetic code & synthetic biology applications.',
    species: SPECIES_HUMAN_MODEL,
    examples: [
      { title: 'Suppressor tRNA', sequence: EXAMPLE_SEQ_SHORT, species: 'Escherichia coli', source: 'Science 2024', description: 'Amber suppressor tRNA for unnatural amino acid incorporation.' },
      { title: 'Optimized Ser-tRNA', sequence: EXAMPLE_SEQ_SHORT, species: 'Homo sapiens', source: 'Nucleic Acids Res. 2023', description: 'Engineered serine tRNA with improved aminoacylation.' },
    ],
    achievements: [
      { title: 'Aminoacylation Rate', metric: 'Efficiency', value: '92%', description: 'High fidelity aminoacylation with engineered synthetases.', paper: '#' },
      { title: 'Suppression Efficiency', metric: 'Read-through', value: '78%', description: 'Efficient amber codon suppression for ncAA incorporation.', paper: '#' },
    ],
    visualizations: [
      { title: 'tRNA Distribution Analysis', description: 'Distributional comparisons between AI generated RNAs and natural RNAs.', imagePath: '/eva1/output/tRNA_comparison.webp', imageAlt: 'tRNA distribution comparison' },
    ],
  },
  {
    id: 'rRNA', name: 'rRNA Design', col: '#00a8c8', tag: 'Structural RNA',
    desc: 'Ribosomal RNA analysis for antibiotic targets & ribosome engineering.',
    species: SPECIES_BROAD,
    examples: [
      { title: '16S rRNA Variant', sequence: EXAMPLE_SEQ_MEDIUM, species: 'Escherichia coli', source: 'PNAS 2024', description: 'Engineered 16S rRNA with altered decoding properties.' },
    ],
    achievements: [
      { title: 'Antibiotic Resistance', metric: 'Prediction', value: '94%', description: 'Accurate prediction of resistance-conferring mutations.', paper: '#' },
      { title: 'Ribosome Assembly', metric: 'Success Rate', value: '88%', description: 'Functional ribosome assembly with modified rRNA.', paper: '#' },
    ],
    visualizations: [
      { title: 'rRNA Distribution Analysis', description: 'Distributional comparisons between AI generated RNAs and natural RNAs.', imagePath: '/eva1/output/rRNA_comparison.webp', imageAlt: 'rRNA distribution comparison' },
    ],
  },
  {
    id: 'miRNA', name: 'miRNA Design', col: '#f0a040', tag: 'Regulatory RNA',
    desc: 'MicroRNA design for gene regulation, therapeutics & biomarker discovery.',
    species: SPECIES_HUMAN_MODEL,
    examples: [
      { title: 'miR-21 Inhibitor', sequence: 'UAGCUUAUCAGACUGAUGUUGA', species: 'Homo sapiens', source: 'Nature Medicine 2024', description: 'Anti-miR-21 sequence for oncology applications.' },
      { title: 'Synthetic miRNA Mimic', sequence: 'CAUCAAAGUGCUGUUCUGUGC', species: 'Mus musculus', source: 'Mol. Therapy 2023', description: 'Designed miRNA mimic targeting inflammatory pathways.' },
    ],
    achievements: [
      { title: 'Target Prediction', metric: 'AUC', value: '0.96', description: 'State-of-the-art miRNA target prediction accuracy.', paper: '#' },
      { title: 'Silencing Efficiency', metric: 'Knockdown', value: '85%', description: 'Average gene silencing with designed miRNA mimics.', paper: '#' },
    ],
    visualizations: [
      { title: 'miRNA Distribution Analysis', description: 'Distributional comparisons between AI generated RNAs and natural RNAs.', imagePath: '/eva1/output/miRNA_comparison.webp', imageAlt: 'miRNA distribution comparison' },
    ],
  },
  {
    id: 'siRNA', name: 'siRNA Design', col: '#00dce8', tag: 'Therapeutic RNA',
    desc: 'Small interfering RNA for targeted gene silencing & RNA interference therapy.',
    species: SPECIES_HUMAN_MODEL,
    examples: [
      { title: 'PCSK9 siRNA', sequence: 'GCAAGAAUCCUGAUUGAAATT', species: 'Homo sapiens', source: 'NEJM 2024', description: 'Clinically validated siRNA targeting PCSK9 for cholesterol reduction.' },
    ],
    achievements: [
      { title: 'Gene Knockdown', metric: 'Efficiency', value: '93%', description: 'Superior gene silencing compared to conventional design tools.', paper: '#' },
      { title: 'Off-target Score', metric: 'Specificity', value: '0.98', description: 'Minimal off-target effects with optimized seed regions.', paper: '#' },
    ],
    visualizations: [
      { title: 'siRNA Distribution Analysis', description: 'Distributional comparisons between AI generated RNAs and natural RNAs.', imagePath: '/eva1/output/miRNA_comparison.webp', imageAlt: 'siRNA distribution comparison' },
    ],
  },
  {
    id: 'circRNA', name: 'CircRNA Design', col: '#d87820', tag: 'Circular RNA',
    desc: 'Circular RNA engineering for stable expression, vaccine platforms & sponge design.',
    species: SPECIES_HUMAN_MODEL,
    examples: [
      { title: 'circRNA Vaccine Scaffold', sequence: EXAMPLE_SEQ_MEDIUM, species: 'Homo sapiens', source: 'Cell 2024', description: 'Circular RNA scaffold for enhanced antigen presentation.' },
      { title: 'miRNA Sponge circRNA', sequence: EXAMPLE_SEQ_SHORT, species: 'Homo sapiens', source: 'Mol. Cell 2023', description: 'Engineered circRNA sponge for competitive miRNA binding.' },
    ],
    achievements: [
      { title: 'Expression Duration', metric: 'Stability', value: '72h', description: 'Sustained protein expression from circular RNA constructs.', paper: '#' },
      { title: 'Circularization', metric: 'Efficiency', value: '90%', description: 'High-efficiency circularization with optimized splice sites.', paper: '#' },
    ],
    visualizations: [
      { title: 'circRNA Distribution Analysis', description: 'Distributional comparisons between AI generated RNAs and natural RNAs.', imagePath: '/eva1/output/circRNA_comparison.webp', imageAlt: 'circRNA distribution comparison' },
      { title: 'mRNA Distribution Analysis', description: 'Distributional comparisons between AI generated RNAs and natural RNAs.', imagePath: '/eva1/output/mRNA_comparison.webp', imageAlt: 'mRNA distribution comparison' },
    ],
  },
  {
    id: 'lncRNA', name: 'lncRNA Design', col: '#20b8d0', tag: 'Non-coding RNA',
    desc: 'Long non-coding RNA for epigenetic regulation & chromatin remodeling.',
    species: SPECIES_HUMAN_MODEL,
    examples: [
      { title: 'XIST-like lncRNA', sequence: EXAMPLE_SEQ_MEDIUM, species: 'Homo sapiens', source: 'Nature 2024', description: 'Synthetic lncRNA mimicking XIST chromatin silencing function.' },
    ],
    achievements: [
      { title: 'Chromatin Binding', metric: 'Specificity', value: '0.91', description: 'Precise chromatin targeting with designed lncRNA domains.', paper: '#' },
      { title: 'Gene Regulation', metric: 'Fold Change', value: '8.5x', description: 'Effective transcriptional regulation via synthetic lncRNA.', paper: '#' },
    ],
    visualizations: [
      { title: 'lncRNA Distribution Analysis', description: 'Distributional comparisons between AI generated RNAs and natural RNAs.', imagePath: '/eva1/output/lncRNA_comparison.webp', imageAlt: 'lncRNA distribution comparison' },
    ],
  },
  {
    id: 'snRNA', name: 'snRNA Design', col: '#e8a048', tag: 'Nuclear RNA',
    desc: 'Small nuclear RNA for splicing regulation & spliceosomal complex engineering.',
    species: SPECIES_BROAD,
    examples: [
      { title: 'Modified U1 snRNA', sequence: EXAMPLE_SEQ_SHORT, species: 'Homo sapiens', source: 'Genes & Dev. 2024', description: 'Engineered U1 snRNA for splice site redirection.' },
    ],
    achievements: [
      { title: 'Splicing Correction', metric: 'Efficiency', value: '82%', description: 'Effective exon inclusion rescue with modified snRNA.', paper: '#' },
    ],
    visualizations: [
      { title: 'snRNA Distribution Analysis', description: 'Distributional comparisons between AI generated RNAs and natural RNAs.', imagePath: '/eva1/output/snRNA_comparison.webp', imageAlt: 'snRNA distribution comparison' },
    ],
  },
  {
    id: 'snoRNA', name: 'snoRNA Design', col: '#008cb0', tag: 'Guide RNA',
    desc: 'Small nucleolar RNA for ribosomal modification & RNA processing guidance.',
    species: SPECIES_BROAD,
    examples: [
      { title: 'Box C/D snoRNA Guide', sequence: EXAMPLE_SEQ_SHORT, species: 'Saccharomyces cerevisiae', source: 'RNA 2024', description: 'Designed box C/D snoRNA for targeted 2\'-O-methylation.' },
    ],
    achievements: [
      { title: 'Modification Accuracy', metric: 'Site Specificity', value: '96%', description: 'Precise targeting of rRNA modification sites.', paper: '#' },
    ],
    visualizations: [
      { title: 'snoRNA Distribution Analysis', description: 'Distributional comparisons between AI generated RNAs and natural RNAs.', imagePath: '/eva1/output/snoRNA_comparison.webp', imageAlt: 'snoRNA distribution comparison' },
    ],
  },
  {
    id: 'piRNA', name: 'piRNA Design', col: '#f5b858', tag: 'Silencing RNA',
    desc: 'Piwi-interacting RNA for transposon silencing & germline genome defense.',
    species: ['Homo sapiens', 'Mus musculus', 'Drosophila melanogaster', 'Caenorhabditis elegans', 'Danio rerio'],
    examples: [
      { title: 'Transposon Silencer', sequence: 'UGAGAUAGCAGAGUUUCCGAACGGUAGA', species: 'Drosophila melanogaster', source: 'Dev. Cell 2024', description: 'piRNA targeting LINE-1 transposable elements.' },
    ],
    achievements: [
      { title: 'Transposon Silencing', metric: 'Repression', value: '89%', description: 'Effective transposon silencing in germline cells.', paper: '#' },
    ],
    visualizations: [
      { title: 'piRNA Distribution Analysis', description: 'Distributional comparisons between AI generated RNAs and natural RNAs.', imagePath: '/eva1/output/piRNA_comparison.webp', imageAlt: 'piRNA distribution comparison' },
    ],
  },
  {
    id: 'sRNA', name: 'sRNA Design', col: '#00b0c8', tag: 'Bacterial RNA',
    desc: 'Small regulatory RNA for bacterial gene regulation & synthetic biology circuits.',
    species: SPECIES_BACTERIAL,
    examples: [
      { title: 'Synthetic Riboswitch', sequence: EXAMPLE_SEQ_SHORT, species: 'Escherichia coli', source: 'ACS Synth. Biol. 2024', description: 'Engineered sRNA for gene circuit regulation.' },
    ],
    achievements: [
      { title: 'Regulatory Range', metric: 'Dynamic Range', value: '50x', description: 'Wide dynamic range in gene expression control.', paper: '#' },
      { title: 'Orthogonality', metric: 'Crosstalk', value: '<2%', description: 'Minimal crosstalk between orthogonal sRNA regulators.', paper: '#' },
    ],
    visualizations: [
      { title: 'sRNA Distribution Analysis', description: 'Distributional comparisons between AI generated RNAs and natural RNAs.', imagePath: '/eva1/output/sRNA_comparison.webp', imageAlt: 'sRNA distribution comparison' },
    ],
  },
  {
    id: 'virus', name: 'RNA Virus Design', col: '#e07828', tag: 'Viral RNA',
    desc: 'RNA virus genome analysis, attenuated vaccine design & antiviral target discovery.',
    species: SPECIES_VIRAL,
    examples: [
      { title: 'Attenuated SARS-CoV-2', sequence: EXAMPLE_SEQ_MEDIUM, species: 'SARS-CoV-2', source: 'Science 2024', description: 'Computationally designed attenuated coronavirus variant.' },
    ],
    achievements: [
      { title: 'Attenuation Accuracy', metric: 'Prediction', value: '97%', description: 'Accurate prediction of attenuating mutations.', paper: '#' },
      { title: 'Antiviral Targets', metric: 'Validated', value: '23', description: 'Novel antiviral target sites identified by the model.', paper: '#' },
    ],
    visualizations: [
      { title: 'Viral RNA Distribution Analysis', description: 'Distributional comparisons between AI generated RNAs and natural RNAs.', imagePath: '/eva1/output/viral_comparison.webp', imageAlt: 'viral RNA distribution comparison' },
    ],
  },
];

export { mockSeq, EXAMPLE_SEQ_MASK };
