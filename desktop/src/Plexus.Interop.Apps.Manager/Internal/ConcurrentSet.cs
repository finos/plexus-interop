namespace Plexus.Interop.Apps.Internal
{
    using System.Collections.Generic;
    using System.Collections;
    using System.Collections.Concurrent;
    using System.Linq;

    internal class ConcurrentSet<T> : IEnumerable<T>
    {
        private readonly ConcurrentDictionary<T, byte> _innerSet;

        public ConcurrentSet()
        {
            _innerSet = new ConcurrentDictionary<T, byte>();
        }

        public ConcurrentSet(IEqualityComparer<T> comparer)
        {
            _innerSet = new ConcurrentDictionary<T, byte>(comparer);
        }

        public ConcurrentSet(IEnumerable<T> collection) : this()
        {
            foreach (var item in collection)
            {
                Add(item);
            }
        }

        public IEnumerator<T> GetEnumerator()
        {
            return _innerSet.Keys.GetEnumerator();
        }

        public void Clear()
        {
            _innerSet.Clear();
        }

        public bool Contains(T item)
        {
            return _innerSet.ContainsKey(item);
        }

        public void CopyTo(T[] array, int arrayIndex)
        {
            _innerSet.Keys.CopyTo(array, arrayIndex);
        }

        public bool Remove(T item)
        {
            byte dummy;
            return _innerSet.TryRemove(item, out dummy);
        }

        public int Count
        {
            get { return _innerSet.Count; }
        }

        public bool Add(T item)
        {
            return _innerSet.TryAdd(item, 0);
        }

        public T[] ToArray()
        {
            return _innerSet.Keys.ToArray();
        }

        IEnumerator IEnumerable.GetEnumerator()
        {
            return GetEnumerator();
        }
    }
}
