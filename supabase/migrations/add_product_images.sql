-- =====================================================
-- SCRIPT PARA ADICIONAR IMAGENS REAIS AOS PRODUTOS
-- =====================================================
-- Execute este script no SQL Editor do Supabase para
-- atualizar a tabela product_images com imagens reais
-- da internet (Unsplash).
-- =====================================================

DO $$
DECLARE
  p_dipirona UUID;
  p_paracetamol UUID;
  p_sabonete UUID;
  p_colgate UUID;
  p_protetor UUID;
  p_vitamina UUID;
BEGIN
  -- Buscar IDs dos produtos pelos slugs
  SELECT id INTO p_dipirona FROM products WHERE slug = 'dipirona-500mg';
  SELECT id INTO p_paracetamol FROM products WHERE slug = 'paracetamol-750mg';
  SELECT id INTO p_sabonete FROM products WHERE slug = 'sabonete-antibacteriano';
  SELECT id INTO p_colgate FROM products WHERE slug = 'creme-dental-colgate';
  SELECT id INTO p_protetor FROM products WHERE slug = 'protetor-solar-fps50';
  SELECT id INTO p_vitamina FROM products WHERE slug = 'vitamina-c-1000mg';

  -- Limpar imagens existentes desses produtos
  DELETE FROM product_images WHERE product_id IN (p_dipirona, p_paracetamol, p_sabonete, p_colgate, p_protetor, p_vitamina);

  -- Inserir imagens reais (Unsplash)
  
  -- Dipirona (Genérico - Comprimidos)
  IF p_dipirona IS NOT NULL THEN
    INSERT INTO product_images (product_id, url, alt_text) VALUES 
    (p_dipirona, 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=600', 'Dipirona 500mg - Comprimidos');
  END IF;

  -- Paracetamol (Cartela de Comprimidos)
  IF p_paracetamol IS NOT NULL THEN
    INSERT INTO product_images (product_id, url, alt_text) VALUES 
    (p_paracetamol, 'https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&q=80&w=600', 'Paracetamol 750mg - Blister');
  END IF;

  -- Sabonete (Barra de Sabonete)
  IF p_sabonete IS NOT NULL THEN
    INSERT INTO product_images (product_id, url, alt_text) VALUES 
    (p_sabonete, 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&q=80&w=600', 'Sabonete Antibacteriano - Barra');
  END IF;

  -- Creme Dental (Escova e Pasta)
  IF p_colgate IS NOT NULL THEN
    INSERT INTO product_images (product_id, url, alt_text) VALUES 
    (p_colgate, 'https://images.unsplash.com/photo-1559599189-fe84fea876eb?auto=format&fit=crop&q=80&w=600', 'Creme Dental Colgate - Tubo');
  END IF;

  -- Protetor Solar (Loção)
  IF p_protetor IS NOT NULL THEN
    INSERT INTO product_images (product_id, url, alt_text) VALUES 
    (p_protetor, 'https://images.unsplash.com/photo-1521481020434-71d60a0781c1?auto=format&fit=crop&q=80&w=600', 'Protetor Solar FPS 50 - Frasco');
  END IF;

  -- Vitamina C (Laranja/Vitamina)
  IF p_vitamina IS NOT NULL THEN
    INSERT INTO product_images (product_id, url, alt_text) VALUES 
    (p_vitamina, 'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?auto=format&fit=crop&q=80&w=600', 'Vitamina C 1000mg - Efervescente');
  END IF;

END $$;

SELECT 'Imagens reais (Unsplash) adicionadas com sucesso!' as status;
