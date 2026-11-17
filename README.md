# Pattern

Écris une expression régulière et vois-la trouver ses correspondances en direct dans ton texte, avec chaque morceau du motif expliqué en français.

*English version: [README.en.md](README.en.md)*

![Pattern](screenshots/1.jpg)

## Version téléphone

- Même écran que sur PC, rangé en une colonne : motif, options, texte, correspondances, puis l'explication en dessous.
- Dans l'aide-mémoire, **touche** un élément pour l'insérer à l'endroit du curseur.
- Les mêmes motifs enregistrés que sur PC (même identifiant `neodex.pattern`).

## Tester un motif

- Tape le motif entre les deux `/` et ton texte dessous : les correspondances sont surlignées pendant que tu tapes (une couleur sur deux pour bien les séparer ; une correspondance vide est un petit trait rose).
- **Drapeaux** `g i m s u y` : toutes les correspondances, sans les majuscules, `^`/`$` à chaque ligne, le point qui attrape les retours à la ligne, Unicode, collé. Survole un drapeau pour son explication.
- Un motif invalide est signalé avec l'erreur exacte.
- **Un motif qui s'emballe** (des répétitions imbriquées comme `(a+)+`) est arrêté au bout d'une seconde : la recherche tourne à part, NeoDex ne fige jamais.

## Comprendre

- **Explication** : le motif découpé morceau par morceau, en français, avec l'imbrication des groupes (« un chiffre — de 2 à 4 fois », « vérifie que la suite n'est PAS… »).
- **Détail** : chaque correspondance avec sa position et ses groupes, numérotés et nommés.
- **Aide-mémoire** : les 24 constructions les plus utiles ; un clic les insère à l'endroit du curseur. Et 8 exemples prêts : e-mail, date, téléphone français, lien, couleur, IPv4, mot répété, nombres à virgule.

## Remplacer

Le champ **Remplacer par** accepte `$1`, `$<nom>`, `$&` (toute la correspondance) : le texte remplacé s'affiche dessous, et **Copier le résultat** le met dans le presse-papiers.

## Mes motifs

Garde tes motifs avec un nom, leurs drapeaux, leur texte d'essai et leur remplacement (100 au plus). Ils sont dans le dossier du plugin. Autorisation : `storage` seulement.


