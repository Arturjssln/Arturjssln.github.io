---
layout: projects
title: "Geometry Matters: 3D Foundation Priors for Learning Semantic Correspondence"
abstract: "Foundation features from self-supervised vision models and text-to-image diffusion models have proven effective for semantic correspondence estimation. However, because these features are learned primarily from 2D image objectives, they lack explicit 3D awareness and often confuse symmetric object sides, repeated parts, and visually similar structures that are distinct in 3D. We introduce a 3D-aware post-training framework that goes beyond available 2D foundation features by incorporating priors from 3D foundation models. Given an image, our method uses SAM3D to estimate object geometry and pose, and refines the pose through render-and-compare optimization. Subsequently, we render PartField descriptors from the reconstructed geometry into the image plane based on the estimated object pose. The resulting geometry-aware feature maps complement DINO and Stable Diffusion features, while geodesic distances on the reconstructed shapes enable reliable filtering of candidate correspondences. We use the filtered matches as supervision to train a lightweight adapter on top of DINO and Stable Diffusion for semantic correspondence. In contrast to prior post-training approaches that require pose annotations and rely on coarse spherical geometry, our method automatically obtains instance-specific 3D structure and uses it to guide correspondence learning. Experiments show that our approach improves semantic correspondence over prior methods while reducing manual geometric supervision."
img_carousel1: assets/img/3dsc/teaser-1.png
description_carousel1: "(a) SD+DINO: existing zero-shot pipelines suffer from left–right and repeated-part confusion, producing many incorrect matches."
img_carousel2: assets/img/3dsc/teaser-2.png
description_carousel2: "(b) SD+DINO + Geodesic Filtering: adding our geodesic filter removes wrong matches but is bottlenecked by feature quality, often leaving few surviving correspondences."
img_carousel3: assets/img/3dsc/teaser-3.png
description_carousel3: "(c) SD+DINO+PartField + Geodesic Filtering: adding PartField features yields dense and accurate correspondences even with large pose changes."
img_carousel4: assets/img/3dsc/qualitative.png
description_carousel4: "Qualitative pseudo-annotations. 3D-SC produces denser and more geometrically consistent pseudo-annotations than DIY-SC, free from left–right ambiguities."
pdf_figure1: assets/img/3dsc/pipeline-data_cropped.pdf
pdf_figure1_caption: "Canonicalized 3D object reconstruction pipeline. Given an image, we obtain an instance mask and a mesh from foundation models. We refine the mesh pose via a two-phase render-and-compare optimization (distance-transform + soft-IoU), then resolve the four-fold yaw ambiguity using OrientAnything V2 with majority voting."
pdf_figure2: assets/img/3dsc/pipeline-corresp_cropped.pdf
pdf_figure2_caption: "Pseudo-label correspondences pipeline. DINO, SD, and PartField features (rasterized from the reconstructed meshes) are fused and candidate matches are proposed via nearest-neighbor search with relaxed cyclic consistency. Each candidate is then verified by lifting matched pixels onto the meshes and computing the bicyclic geodesic error; candidates exceeding the threshold are rejected."
bibtex: "@inproceedings{jesslen2026geometry,\n\t author  = {Artur Jesslen and Olaf D{\\\"u}nkel and Adam Kortylewski},\n\t title   = {Geometry Matters: 3D Foundation Priors for Learning Semantic Correspondence},\n\t booktitle = {Arxiv},\n\t year    = {2026}\n }"
---

[Artur Jesslen](https://artur.jesslen.ch)<sup>1</sup>, [Olaf Dünkel](https://odunkel.github.io)<sup>2</sup>, and [Adam Kortylewski](https://genintel.de)<sup>3</sup>

<div class="is-size-5 publication-authors">
<span class="author-block">
<sup>1</sup>University of Freiburg, Germany &nbsp;
<sup>2</sup>Max Planck Institute for Informatics, Saarland Informatics Campus, Germany &nbsp;
<sup>3</sup>CISPA Helmholtz Center for Information Security, Germany
<br>
<strong>Arxiv 2026</strong>
</span>
</div>
