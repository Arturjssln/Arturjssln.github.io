---
layout: projects
title: "Category-Level 3D Correspondence in Camera Space via Morphable Object Priors"
abstract: "Understanding 3D objects from images is fundamental to robotics and AR/VR applications. While recent work has made progress in category-level pose estimation, current representations fail to capture the fine-grained semantics needed for reasoning about object parts, functions, and interactions. In this work, we study category-level 3D correspondence in camera space—predicting, from a single image, 3D locations that remain consistent across instances within a category—and show that it can emerge without explicit correspondence supervision by learning a shared morphable object prior. To enable research in this direction, we introduce HouseCorr3D, the first large-scale benchmark for monocular category-level 3D correspondence with 178k images across 50 household object categories, 280 unique instances, and 3D keypoint annotations directly on CAD models. Crucially, HouseCorr3D provides amodal correspondence labels for occluded regions and explicit symmetry annotations, addressing key limitations of existing datasets. We further propose Morpheus, a method that learns morphable category-level shape priors by disentangling canonical shape, deformation, and object pose. Through this shared canonical grounding, semantically meaningful 3D correspondences in camera space emerge implicitly. These emerging 3D correspondences set a new state of the art on HouseCorr3D, demonstrating that semantic 3D object understanding can arise without direct correspondence supervision."
img_carousel1: assets/img/morpheus/teaser.png
description_carousel1: "Monocular Category-Level 3D Correspondence. We predict semantically consistent 3D keypoint locations across different instances of the same category from single RGB-D images, enabling fine-grained object understanding beyond traditional pose estimation."
img_carousel2: assets/img/morpheus/teaser2.png
description_carousel2: "Morpheus establishes correspondences by mediating all predictions through a shared deformable template, enabling semantically aligned 3D correspondences in camera space."
img_carousel3: assets/img/morpheus/qualitative.png
description_carousel3: "Qualitative results. Morpheus (rightmost) outperforms DINOv2, GenPose++, and MagicPony. MagicPony's predictions may appear plausible in 2D but are often incorrect in 3D, as 2D supervision alone does not constrain 3D structure."
img_carousel4: assets/img/morpheus/qualitative2.png
description_carousel4: "Additional qualitative comparisons demonstrating Morpheus's ability to establish accurate 3D correspondences across diverse object categories and viewpoints."
img_figure1: assets/img/morpheus/pipeline.png
img_figure1_caption: "Pipeline. Given an RGB-D image, the deformation encoder predicts a latent code that drives the decoder to adapt the category shape prior to the observed instance. The deformed mesh is placed in camera space using the predicted 6D pose. Training uses amodal 2D and 3D losses together with pose supervision."
img_figure2: assets/img/morpheus/dataset_overview.png
img_figure2_caption: "HouseCorr3D Dataset Overview. We annotate up to 19 3D keypoints directly on CAD meshes for 5–13 instances per category, covering 50 common household object classes. Keypoints are semantically consistent and shared across all instances within each category."
bibtex: "@misc{sommer2026morpheus,\n\t title   = {Category-Level 3D Correspondence in Camera Space via Morphable Object Priors},\n\t author  = {Leonhard Sommer and Artur Jesslen and Basavaraj Sunagad and Adam Kortylewski},\n\t archivePrefix = {ECCV},\n\t year    = {2026}\n }"
---

[Leonhard Sommer](https://scholar.google.com/citations?user=_QifWhEAAAAJ&hl=de)<sup>*1</sup>, [Artur Jesslen](https://artur.jesslen.ch)<sup>*1</sup>, Basavaraj Sunagad<sup>1</sup>, and [Adam Kortylewski](https://genintel.de)<sup>2</sup>

<div class="is-size-5 publication-authors">
<span class="author-block">
<sup>1</sup>University of Freiburg, Germany &nbsp;
<sup>2</sup>CISPA Helmholtz Center for Information Security, Germany
<br>
<strong>ECCV 2026</strong> &nbsp; <sup>*</sup>equal contribution
</span>
</div>
