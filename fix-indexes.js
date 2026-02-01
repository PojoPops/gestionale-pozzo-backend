// Script per eliminare l'indice vecchio di numeroBolla
// Esegui con: mongosh < fix-indexes.js

db = db.getSiblingDB('test');

print('==============================================');
print('🔍 INDICI ESISTENTI nella collection bollas:');
print('==============================================');
printjson(db.bollas.getIndexes());

print('\n==============================================');
print('🗑️  ELIMINAZIONE indice numeroBolla_1...');
print('==============================================');

try {
  const result = db.bollas.dropIndex('numeroBolla_1');
  print('✅ Indice numeroBolla_1 eliminato con successo!');
  printjson(result);
} catch (e) {
  if (e.message.includes('index not found')) {
    print('ℹ️  L\'indice numeroBolla_1 non esiste (probabilmente già eliminato)');
  } else {
    print('❌ Errore durante l\'eliminazione:', e.message);
  }
}

print('\n==============================================');
print('✅ INDICI FINALI nella collection bollas:');
print('==============================================');
printjson(db.bollas.getIndexes());

print('\n==============================================');
print('📋 VERIFICA: Dovrebbe esserci solo:');
print('   - _id_ (indice di default)');
print('   - pozzoId_1_numeroBolla_1 (indice composto corretto)');
print('==============================================\n');