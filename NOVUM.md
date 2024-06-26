---
layout: projects
title: "NOVUM: Neural Object Volumes for Robust Object Classification"
arxiv_pdf: https://arxiv.org/pdf/2303.16839.pdf
github_link: https://github.com/Generative-Vision-Robust-Learning/NeMo-Classification
arxiv_link: https://arxiv.org/abs/2303.16839
abstract: Discriminative models for object classification typically learn image-based representations that do not capture the compositional and 3D nature of objects. In this work, we show that explicitly integrating 3D compositional object representations into deep networks for image classification leads to a largely enhanced generalization in out-of-distribution scenarios. In particular, we introduce a novel architecture, referred to as NOVUM, that consists of a feature extractor and a neural object volume for every target object class. Each neural object volume is a composition of 3D Gaussians that emit feature vectors. This compositional object representation allows for a highly robust and fast estimation of the object class by independently matching the features of the 3D Gaussians of each category to features extracted from an input image. Additionally, the object pose can be estimated via inverse rendering of the corresponding neural object volume. To enable the classification of objects, the neural features at each 3D Gaussian are trained discriminatively to be distinct from (i) the features of 3D Gaussians in other categories, (ii) features of other 3D Gaussians of the same object, and (iii) the background features. Our experiments show that NOVUM offers intriguing advantages over standard architectures due to the 3D compositional structure of the object representation, namely (1) An exceptional robustness across a spectrum of real-world and synthetic out-of-distribution shifts and (2) an enhanced human interpretability compared to standard models, all while maintaining real-time inference and a competitive accuracy on in-distribution data. Code and model can be found [here](https://github.com/Generative-Vision-Robust-Learning/NeMo-Classification).
teaser_video: assets/videos/banner_video.mp4
teaser_video_description: TODO
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
