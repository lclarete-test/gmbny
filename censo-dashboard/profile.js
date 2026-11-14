import {healthFields} from './analytics.js?v=complete-20261112';
export function weightedQuantile(records,selector,q=.5){
  const pairs=records.map(r=>({value:selector(r),weight:r.weight})).filter(p=>p.value!==null&&Number.isFinite(p.value)&&Number.isFinite(p.weight)&&p.weight>0).sort((a,b)=>a.value-b.value);
  const total=pairs.reduce((sum,p)=>sum+p.weight,0);
  if(!total)return null;
  let cumulative=0;
  for(const p of pairs){cumulative+=p.weight;if(cumulative>=q*total)return p.value;}
  return pairs.at(-1).value;
}

export function populationProfile(model,rows){
  const sum=rr=>model.total(rr),age=r=>model.number(r,'AGE');
  const adults=rows.filter(r=>age(r)>=18),age25=rows.filter(r=>age(r)>=25),age16=rows.filter(r=>age(r)>=16),age5=rows.filter(r=>age(r)>=5);
  const stats={n:rows.length,population:sum(rows)};
  const configurations=[
    {id:'sexo',group:'Quem são',title:'Sexo informado',universe:'Todas as idades',rows,description:'Distribuição de pessoas pelas categorias de sexo disponíveis na ACS.'},
    {id:'idade',group:'Quem são',title:'Faixa etária',universe:'Todas as idades',rows,description:'Idade em anos completos na entrevista.'},
    {id:'escolaridade',group:'Quem são',title:'Escolaridade · 25 anos ou mais',universe:'Pessoas de 25 anos ou mais',rows:age25,description:'Maior nível concluído. O recorte de 25 anos ou mais evita comparar a escolaridade de crianças com a de adultos.'},
    {id:'ingles',group:'Quem são',title:'Nível de inglês',universe:'Pessoas de 5 anos ou mais',rows:age5,description:'Habilidade de fala declarada. Só inglês em casa permanece como categoria própria.'},
    {id:'estado',group:'Onde vivem',title:'Estado de residência',universe:'Todas as idades',rows,description:'Distribuição da população estimada entre os três estados.'},
    {id:'metropolitana',group:'Onde vivem',title:'Região metropolitana',universe:'Todas as idades',rows,includeMissing:true,top:7,description:'Áreas metropolitanas aproximadas, não municípios. Inclui a parcela em área não identificável.'},
    {id:'cidade',group:'Onde vivem',title:'Municípios identificáveis',universe:'Todas as idades',rows,includeMissing:true,top:10,wide:true,description:'A categoria não identificável permanece no denominador. Não foi inferida a cidade a partir da região metropolitana.'},
    {id:'emprego',group:'Trabalho e renda',title:'Situação de emprego',universe:'Pessoas de 16 anos ou mais',rows:age16,description:'Empregado, desempregado que busca trabalho e fora da força de trabalho são categorias distintas.'},
    {id:'cidadania',group:'Quem são',title:'Cidadania e naturalização',universe:'Todas as idades',rows,description:'Naturalização, não cidadania e cidadania americana ao nascer são apresentadas separadamente.'},
    {id:'seguro',group:'Saúde',title:'Seguro de saúde',universe:'Todas as idades',rows,description:'Categorias exclusivas: sem seguro, somente privado, somente público ou ambos.'},
    {id:'renda_pessoal',group:'Trabalho e renda',title:'Renda pessoal total · anual',universe:'Pessoas de 18 anos ou mais com renda informada',rows:adults,description:'Renda total pré-impostos dos 12 meses anteriores, em dólares correntes. Renda zero e renda negativa são válidas.'},
    {id:'renda_familiar',group:'Trabalho e renda',title:'Renda familiar total · anual',universe:'Todas as idades, com renda familiar informada',rows,description:'Percentual de pessoas em cada faixa de renda da família; não é uma contagem de famílias ou domicílios.'},
    {id:'renda_trabalho',group:'Trabalho e renda',title:'Renda do trabalho · anual',universe:'18 anos ou mais · inclui renda zero',rows:adults,description:model.byId.renda_trabalho.description},
    {id:'renda_per_capita',group:'Trabalho e renda',title:'Renda familiar por pessoa',universe:'FTOTINC ÷ FAMSIZE · US$ por ano',rows,description:model.byId.renda_per_capita.description},
    {id:'pobreza',group:'Trabalho e renda',title:'Renda e limiar de pobreza',universe:'Pessoas com informação válida',rows,description:model.byId.pobreza.description},
    {id:'cobertura',group:'Saúde',title:'Tem seguro de saúde?',universe:'Todas as idades',rows,description:model.byId.cobertura.description},
    ...healthFields.map(field=>({id:field.id,group:'Saúde',title:field.label,universe:field.age?field.age+' anos ou mais':'Todas as idades',rows:rows.filter(r=>age(r)>=field.age),description:field.description})),
    {id:'familia',group:'Família e trajetória',title:'Tamanho da família',universe:'Todas as idades',rows,description:'Familiares corresidentes, incluindo a própria pessoa. Não equivale ao total de moradores do domicílio.'},
    {id:'filhos',group:'Família e trajetória',title:'Filhos próprios corresidentes',universe:'Pessoas de 18 anos ou mais',rows:adults,description:'Filhos de qualquer idade presentes no domicílio. Ausência de filhos corresidentes não significa ausência de filhos.'},
    {id:'tempo_eua',group:'Família e trajetória',title:'Tempo nos Estados Unidos',universe:'Pessoas de 18 anos ou mais',rows:adults,description:'Anos de residência nos EUA entre os adultos nascidos no Brasil.'},
  ];
  const sections=configurations.map(config=>{
    const distribution=model.frequency(config.rows,config.id,!config.includeMissing);
    const missingRows=config.rows.filter(r=>model.byId[config.id].category(r).missing);
    const validRows=config.rows.filter(r=>config.includeMissing||!model.byId[config.id].category(r).missing);
    return {...config,rows:undefined,n:distribution.n,weight:distribution.weight,scopeN:config.rows.length,scopeWeight:sum(config.rows),
      missingN:missingRows.length,missingWeight:sum(missingRows),validRows,categories:distribution.categories.map(c=>({...c,percent:distribution.weight?100*c.weight/distribution.weight:0}))};
  });
  const byId=Object.fromEntries(sections.map(s=>[s.id,s]));
  const share=(id,keys)=>{const s=byId[id];return s.weight?100*s.categories.filter(c=>keys.includes(c.key)).reduce((t,c)=>t+c.weight,0)/s.weight:null;};
  const indicator=(id,label,value,unit,universe,records)=>({id,label,value,unit,universe,n:records.length,weight:sum(records)});
  const incomeRows=byId.renda_pessoal.validRows;
  const indicators=[
    indicator('mulheres','Sexo feminino',share('sexo',['2']),'percent','Todas as idades, sexo informado',byId.sexo.validRows),
    indicator('idade_mediana','Idade mediana',weightedQuantile(rows,age),'anos','Todas as idades',rows),
    indicator('superior_completo','Bacharelado ou pós-graduação',share('escolaridade',['ba','post']),'percent','25 anos ou mais, escolaridade informada',byId.escolaridade.validRows),
    indicator('ingles_limitado','Não fala inglês ou não fala bem',share('ingles',['1','6']),'percent','5 anos ou mais, inglês informado',byId.ingles.validRows),
    indicator('renda_pessoal_mediana','Renda pessoal mediana anual',weightedQuantile(incomeRows,r=>model.number(r,'INCTOT')),'usd','18 anos ou mais, renda informada',incomeRows),
    indicator('tempo_eua_mediano','Tempo mediano nos EUA',weightedQuantile(adults,r=>model.number(r,'YRSUSA1')),'anos','Pessoas de 18 anos ou mais',adults),
    indicator('familia_mediana','Tamanho mediano da família',weightedQuantile(byId.familia.validRows,r=>model.number(r,'FAMSIZE')),'pessoas','Todas as idades, família informada',byId.familia.validRows),
    indicator('naturalizados','Naturalizados',share('cidadania',['2']),'percent','Todas as idades, cidadania informada',byId.cidadania.validRows),
    indicator('sem_seguro','Sem seguro de saúde',share('seguro',['none']),'percent','Todas as idades, cobertura informada',byId.seguro.validRows),
    indicator('cidade_identificavel','Município identificável',byId.cidade.weight?100*(1-byId.cidade.missingWeight/byId.cidade.weight):null,'percent','Todas as idades',rows),
    indicator('renda_familiar_mediana','Renda familiar mediana, ponderada por pessoas',weightedQuantile(byId.renda_familiar.validRows,r=>model.number(r,'FTOTINC')),'usd','Pessoas com renda familiar informada',byId.renda_familiar.validRows),
  ];
  for(const [id,label,selector] of [
    ['renda_trabalho','Renda mediana do trabalho anual',r=>model.number(r,'INCEARN')],
    ['renda_per_capita','Renda familiar mediana por pessoa anual',r=>model.perCapita(r)]
  ]){const eligible=byId[id].validRows;indicators.push(indicator(id+'_mediana',label,weightedQuantile(eligible,selector),'usd',byId[id].universe,eligible));}
  const pc=byId.renda_per_capita.validRows,pcWeight=sum(pc);
  indicators.push(indicator('renda_per_capita_media','Renda familiar média por pessoa anual',pcWeight?pc.reduce((t,r)=>t+r.weight*model.perCapita(r),0)/pcWeight:null,'usd',byId.renda_per_capita.universe,pc));
  indicators.push(indicator('com_filhos','Com filhos próprios corresidentes',share('filhos',['1','2','3']),'percent','18 anos ou mais, filhos próprios de qualquer idade no domicílio',byId.filhos.validRows));
  const labor=byId.emprego.categories.filter(c=>['1','2'].includes(c.key));
  const laborTotal=labor.reduce((s,c)=>s+c.weight,0),unemployed=labor.filter(c=>c.key==='2').reduce((s,c)=>s+c.weight,0);
  const laborRows=age16.filter(r=>['1','2'].includes(model.get(r,'EMPSTAT')));
  indicators.push(indicator('taxa_desemprego','Taxa de desemprego na força de trabalho',laborTotal?100*unemployed/laborTotal:null,'percent','16 anos ou mais, empregados ou desempregados buscando trabalho',laborRows));
  for(const s of sections)delete s.validRows;
  return {...stats,sections,indicators,byId};
}
