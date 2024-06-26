---
layout: projects
title: "NOVUM: Neural Object Volumes for Robust Object Classification"
arxiv_pdf: https://arxiv.org/pdf/2303.16839.pdf
github_link: https://github.com/Generative-Vision-Robust-Learning/NeMo-Classification
arxiv_link: https://arxiv.org/abs/2303.16839
abstract: Discriminative models for object classification typically learn image-based representations that do not capture the compositional and 3D nature of objects. In this work, we show that explicitly integrating 3D compositional object representations into deep networks for image classification leads to a largely enhanced generalization in out-of-distribution scenarios. In particular, we introduce a novel architecture, referred to as NOVUM, that consists of a feature extractor and a neural object volume for every target object class. Each neural object volume is a composition of 3D Gaussians that emit feature vectors. This compositional object representation allows for a highly robust and fast estimation of the object class by independently matching the features of the 3D Gaussians of each category to features extracted from an input image. Additionally, the object pose can be estimated via inverse rendering of the corresponding neural object volume. To enable the classification of objects, the neural features at each 3D Gaussian are trained discriminatively to be distinct from (i) the features of 3D Gaussians in other categories, (ii) features of other 3D Gaussians of the same object, and (iii) the background features. Our experiments show that NOVUM offers intriguing advantages over standard architectures due to the 3D compositional structure of the object representation, namely (1) An exceptional robustness across a spectrum of real-world and synthetic out-of-distribution shifts and (2) an enhanced human interpretability compared to standard models, all while maintaining real-time inference and a competitive accuracy on in-distribution data.
teaser_video: assets/videos/banner_video.mp4
teaser_video_description: TODO
img_carousel1: assets/img/novum/fig1.png
description_carousel1: Figure 1. Schematic overview of how NOVUM is trained. The model consists of a shared backbone (yellow) and one neural object volume for each object class (grey), which are represented as 3D Gaussians on a cuboid shape. During training, the backbone first computes feature maps of the training images. Given the class label and the 3D object pose, the backbone is trained in a contrastive manner using four types of losses. (I) To make features of the same Gaussian similar across instances (green), while at the same time making the features distinct (red) from (II) features of Gaussians from the same object, (III) background features, and (IV) features of Gaussians from other objects.
img_carousel2: assets/img/novum/fig2.png
description_carousel2: Figure 2. 
img_carousel3: assets/img/novum/fig3.png
description_carousel3: Figure 3. (a-b) t-SNE plots comparing (a) the learned features of our approach and (b) the learned vertex features of NeMo. As can be seen, our contrastive loss allows a much clearer distribution of the space while keeping Gaussian features from different
classes far from each other (while the low-quality clustering observed in (b) may likely originates from the ImageNet pretraining). (c-d) t-SNE plots of the mean extracted feature for each car image of the test dataset. We observe a very clear organization of the samples according to the azimuth angle for (c) our approach while this organization is completely absent in (d) other feed-forward baselines (e.g., Resnet50).
img_carousel4: assets/img/novum/fig4.png
description_carousel4: Figure 4. Four qualitative results that were misclassified by ViT-b-16. We show for each (left) the input image and (right) the extracted feature map and the predicted 3D pose overlaid. A smooth color gradient shows a high quality matching. In the extracted features, the brightness illustrates the confidence of the matching with the Gaussian features.
youtube_link: https://www.youtube.com/embed/JkaxUblCGz0
bibtex: BibTex Code Here
---

[Artur Jesslen](https://artur.jesslen.ch)<sup>1\*</sup>, [Guofeng Zhang](https://openreview.net/profile?id=~Guofeng_Zhang4)<sup>2\*</sup>, [Angtian Wang](https://angtianwang.github.io)<sup>2</sup>, [Wufei Ma](https://wufeim.github.io)<sup>2</sup>, [Alan Yuille](https://www.cs.jhu.edu/~ayuille/)<sup>2</sup>, and [Adam Kortylewski](https://gvrl.mpi-inf.mpg.de)<sup>1,3</sup>

<div class="is-size-5 publication-authors">
<span class="author-block">
<sup>1</sup>University of Freiburg &nbsp;
<sup>2</sup>John Hopkins University &nbsp;
<sup>3</sup>Max Planck Institute for Informatics
<br>
ECCV 2024</span>
<span class="eql-cntrb"><small><br><sup>*</sup>Indicates Equal Contribution</small></span>
</div>
