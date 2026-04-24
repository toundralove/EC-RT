INTÉGRATION — EC@RT Zone 01 Poster

1) Remplace le lien CSS :

Au lieu de :
<link rel="stylesheet" href="../zone-01/zone_01_image.css" />

mets :
<link rel="stylesheet" href="../zone-01/zone_01_core.css" />
<link rel="stylesheet" href="../zone-01/zone_01_fx.css" />

2) Remplace le script unique :

Au lieu de :
<script src="zone_01_nav.js"></script>

mets, dans cet ordre :
<script src="zone_01_camera.js"></script>
<script src="zone_01_memory.js"></script>
<script src="zone_01_atmosphere.js"></script>
<script src="zone_01_fragments.js"></script>
<script src="zone_01_main.js"></script>

3) Garde ton HTML actuel :
<div class="image-viewer" id="imageViewer">
  <img src="../../assets/images/zone-01-affiche.jpeg" class="zoom-image" id="zoomImage" ... />
</div>

4) Logique :
- camera = zoom/pan/retour image entière
- atmosphere = voile/flou/messages
- fragments = strates et fragments sensibles
- memory = localStorage

5) Pour effacer la mémoire pendant les tests :
Dans la console navigateur :
localStorage.removeItem("ecart_zone01_fragments_found_v2")
