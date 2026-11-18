import {escapeHTML} from './charts.js';

const bodyAsset = 'media/atlas/glucose-anatomy.png';
const diagramText = 'The pancreas releases insulin. It helps muscle and fat take up glucose and slows glucose release from the liver. U.S. estimates pair each tissue with a clinical outcome. In 2021, 26.43% of people with diabetes had diabetic retinopathy. In 2021 to 2023, 76.4% of adults with diagnosed diabetes had hypertension or used blood pressure medication and 41.7% had stage 1 to 4 chronic kidney disease. In 2023 hospitals recorded 7.30 stays involving lower-limb amputation per 1,000 adults with diagnosed diabetes.';

const sites = {
  pancreas: {
    tissue:'Pancreas',point:[0.544,0.355],
    words:['Beta cells release insulin', 'when blood glucose rises.']
  },
  liver: {
    tissue:'Liver',point:[0.415,0.33],
    words:['After meals, insulin slows', 'the liver’s glucose output.']
  },
  muscle: {
    tissue:'Muscle and fat',point:[0.394,0.602],
    words:['Insulin helps these tissues', 'take up glucose from blood.']
  },
  eyes: {
    tissue:'Eyes',point:[0.528,0.09],number:'26.4%',
    words:['had diabetic retinopathy.', 'People with diabetes, 2021.']
  },
  heart: {
    tissue:'Blood vessels',point:[0.509,0.267],number:'76.4%',
    words:['had high blood pressure or', 'took medication for it.']
  },
  kidneys: {
    tissue:'Kidneys',point:[0.609,0.384],number:'41.7%',
    words:['had stage 1 to 4', 'chronic kidney disease.']
  },
  feet: {
    tissue:'Feet and lower limbs',point:[0.657,0.952],number:'7.30 stays',
    words:['for amputation per 1,000 adults', 'with diagnosed diabetes, 2023.'],
    narrow:['for amputation per 1,000', 'adults with diagnosed', 'diabetes, 2023.']
  }
};

const large = {
  width:920, height:486, body:[334,8,207,470], text:17, small:13.7, heading:19, metric:24, gap:20,
  titleLeft:[17,29],titleRight:[594,29],
  sites:[
    ['pancreas',17,108],['liver',17,242],['muscle',17,368],
    ['eyes',594,69],['heart',594,169],['kidneys',594,281],['feet',594,393]
  ]
};

const small = {
  width:330,height:610,body:[2,106,127,288],text:13.1,small:11.5,heading:15,metric:18.5,gap:16,
  titleLeft:[5,18],titleRight:[148,18],
  sites:[
    ['eyes',145,48],['heart',145,134],['liver',145,230],['pancreas',145,296],
    ['kidneys',145,362],['muscle',145,450],['feet',145,518]
  ]
};

function label(x,y,words,size,css) {
  return '<text x="'+x+'" y="'+y+'" class="'+css+'" font-size="'+size+'">'+escapeHTML(words)+'</text>';
}

function diagram(layout,isSmall) {
  const [bx,by,bw,bh] = layout.body;
  const headings = [
    label(...layout.titleLeft,'Glucose regulation',isSmall?13:18,'cs-bio-key'),
    label(...layout.titleRight,'Clinical findings',isSmall?13:18,'cs-finding-key')
  ];
  const layers = [], texts = [];
  for (const [key,tx,ty] of layout.sites) {
    const site=sites[key], clinical=Boolean(site.number), targetLeft=!isSmall&&!clinical;
    const px=bx+site.point[0]*bw, py=by+site.point[1]*bh;
    const endX=targetLeft?tx+260:tx-7, endY=ty-5;
    const elbowX=targetLeft?bx-12:bx+bw+(isSmall?4:18);
    const innerX=targetLeft?px-12:px+(elbowX-px)*0.48;
    const colorClass=clinical?'cs-finding-line':'cs-bio-line';
    layers.push('<path class="'+colorClass+'" d="M'+px+','+py+' H'+innerX+' L'+elbowX+','+endY+' H'+endX+'"/>',
      '<circle cx="'+px+'" cy="'+py+'" r="'+(isSmall?2.5:3.2)+'" class="'+(clinical?'cs-finding-point':'cs-bio-point')+'"/>');
    texts.push(label(tx,ty,site.tissue,layout.heading,'cs-site'));
    let lineY=ty+layout.gap;
    if(clinical){
      texts.push(label(tx,lineY+(isSmall?1:3),site.number,layout.metric,'cs-value'));
      lineY+=layout.gap;
    }
    const lines=isSmall&&site.narrow?site.narrow:site.words;
    lines.forEach((words,i)=>texts.push(label(tx,lineY+i*layout.gap,words,layout.text,'cs-description')));
    if(key==='heart'||key==='kidneys'){
      const population=isSmall?'Adults with diagnosed':'Adults with diagnosed diabetes, 2021–23.';
      const base=lineY+lines.length*layout.gap;
      texts.push(label(tx,base,population,layout.small,'cs-population'));
      if(isSmall)texts.push(label(tx,base+13,'diabetes, 2021–23.',layout.small,'cs-population'));
    }
  }
  return '<svg class="'+(isSmall?'cs-body-narrow':'cs-body-wide')+'" viewBox="0 0 '+layout.width+' '+layout.height+'" aria-hidden="true" focusable="false">'+
    '<rect x="'+bx+'" y="'+by+'" width="'+bw+'" height="'+bh+'" rx="'+bw/2+'" fill="#f4f3fa"/>'+
    '<image href="'+bodyAsset+'" x="'+bx+'" y="'+by+'" width="'+bw+'" height="'+bh+'"/>'+
    headings.join('')+layers.join('')+texts.join('')+'</svg>';
}

export function wholeBodyFigure() {
  return '<figure class="cs-body-figure" role="img" aria-label="'+escapeHTML(diagramText)+'">'+diagram(large,false)+diagram(small,true)+'</figure>';
}
