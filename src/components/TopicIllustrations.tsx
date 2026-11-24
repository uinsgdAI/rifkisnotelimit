import React from 'react';
import { BearingsIllustration } from './illustrations/BearingsIllustration';
import {
  AnglesIllustration,
  AreaPerimeterIllustration,
  CircleTheorems1Gallery,
  CircleTheorems2Gallery,
  ConstructionsIllustration,
  ExactTrigTrianglesIllustration,
  MensurationNetIllustration,
  NonRightTrigIllustration,
  SectorIllustration,
  SimilarityIllustration,
  SymmetryIllustration,
  Trigonometry3DIllustration,
} from './illustrations/GeometryAndTrigIllustrations';
import {
  ChartsIllustration,
  ConditionalProbIllustration,
  CumulativeFreqBoxIllustration,
  HistogramIllustration,
  ProbabilityTreeDiagramIllustration,
  ScatterCorrelationIllustration,
  SetsVennIllustration,
  VectorGeometryIllustration,
} from './illustrations/AlgebraStatsIllustrations';

interface TopicIllustrationsProps {
  topicId: string;
}

export const TopicIllustrations: React.FC<TopicIllustrationsProps> = ({ topicId }) => {
  switch (topicId) {
    case '1.2':
      return <SetsVennIllustration />;
    case '4.2':
      return <ConstructionsIllustration />;
    case '4.3':
      return <BearingsIllustration />;
    case '4.4':
      return <SimilarityIllustration />;
    case '4.5':
      return <SymmetryIllustration />;
    case '4.6':
      return <AnglesIllustration />;
    case '4.7':
      return <CircleTheorems1Gallery />;
    case '4.8':
      return <CircleTheorems2Gallery />;
    case '5.2':
      return <AreaPerimeterIllustration />;
    case '5.3':
      return <SectorIllustration />;
    case '5.4':
      return <MensurationNetIllustration />;
    case '6.3':
      return <ExactTrigTrianglesIllustration />;
    case '6.5':
      return <NonRightTrigIllustration />;
    case '6.6':
      return <Trigonometry3DIllustration />;
    case '7.4':
      return <VectorGeometryIllustration />;
    case '8.3':
      return <ProbabilityTreeDiagramIllustration />;
    case '8.4':
      return <ConditionalProbIllustration />;
    case '9.4':
      return <ChartsIllustration />;
    case '9.5':
      return <ScatterCorrelationIllustration />;
    case '9.6':
      return <CumulativeFreqBoxIllustration />;
    case '9.7':
      return <HistogramIllustration />;
    default:
      return null;
  }
};
